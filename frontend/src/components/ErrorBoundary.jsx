import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Filter out React DevTools x-line-number errors
    if (error && error.message && error.message.includes('x-line-number')) {
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Filter out React DevTools errors
    if (error && error.message && error.message.includes('x-line-number')) {
      return;
    }
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0F14] flex items-center justify-center">
          <div className="bg-[#1A1F24] border-2 border-red-500 rounded-lg p-8 max-w-lg">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Etwas ist schief gelaufen</h2>
            <p className="text-gray-300 mb-4">
              Das Spiel hat einen unerwarteten Fehler festgestellt.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#00FF88] hover:bg-[#00DD77] text-black font-bold py-2 px-6 rounded-lg transition-all"
            >
              Neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
