import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

export function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-red-100">
      <Card className="w-full max-w-md text-center shadow-card">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full">
              <AlertTriangle className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600 mb-2">
            Something went wrong
          </CardTitle>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-medium text-red-800 mb-1">Error Details:</p>
              <p className="text-xs text-red-600 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={resetError} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              If this problem persists, try:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Refreshing the page</li>
              <li>• Clearing your browser cache</li>
              <li>• Checking your internet connection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by hook:', error, errorInfo);
    // You could also send this to an error reporting service
  };
}