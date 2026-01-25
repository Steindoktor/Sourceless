from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class GameScore(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_name: str = "Anonymous"
    score: int
    level_reached: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GameScoreCreate(BaseModel):
    player_name: Optional[str] = "Anonymous"
    score: int
    level_reached: str


@api_router.get("/")
async def root():
    return {"message": "Connect The World API", "status": "online"}


@api_router.post("/scores", response_model=GameScore)
async def create_score(input_data: GameScoreCreate):
    score_obj = GameScore(**input_data.model_dump())
    
    doc = score_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.game_scores.insert_one(doc)
    return score_obj


@api_router.get("/scores", response_model=List[GameScore])
async def get_high_scores(limit: int = 10):
    scores = await db.game_scores.find(
        {}, 
        {"_id": 0}
    ).sort("score", -1).limit(limit).to_list(limit)
    
    for score in scores:
        if isinstance(score['timestamp'], str):
            score['timestamp'] = datetime.fromisoformat(score['timestamp'])
    
    return scores


@api_router.get("/stats")
async def get_game_stats():
    total_games = await db.game_scores.count_documents({})
    
    if total_games == 0:
        return {
            "total_games": 0,
            "average_score": 0,
            "highest_score": 0,
        }
    
    pipeline = [
        {
            "$group": {
                "_id": None,
                "avg_score": {"$avg": "$score"},
                "max_score": {"$max": "$score"},
            }
        }
    ]
    
    result = await db.game_scores.aggregate(pipeline).to_list(1)
    stats = result[0] if result else {"avg_score": 0, "max_score": 0}
    
    return {
        "total_games": total_games,
        "average_score": round(stats.get("avg_score", 0), 2),
        "highest_score": stats.get("max_score", 0),
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
