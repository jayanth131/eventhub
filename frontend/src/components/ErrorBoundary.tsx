import React, { Component, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--royal-cream)] to-amber-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center border-4 border-[var(--royal-gold)]">
            <div className="mb-6">
              <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl text-[var(--royal-maroon)] mb-2">Oops! Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              {this.state.error && (
                <details className="text-left text-sm text-gray-500 bg-gray-50 p-3 rounded mb-4">
                  <summary className="cursor-pointer font-medium">Error details</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] hover:from-[var(--royal-copper)] hover:to-[var(--royal-maroon)] text-white"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;