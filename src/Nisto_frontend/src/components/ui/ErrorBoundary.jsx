import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      console.error('Error caught by boundary:', error, errorInfo);
    } else {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      const { fallback: Fallback, onError } = this.props;

      // Call custom error handler if provided
      if (onError) {
        onError(error, this.state.errorInfo);
      }

      // Use custom fallback if provided
      if (Fallback) {
        return (
          <Fallback 
            error={error} 
            retry={this.handleRetry}
            retryCount={retryCount}
          />
        );
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                <path d="M2 17L12 22L22 17" fill="currentColor"/>
                <path d="M2 12L12 17L22 12" fill="currentColor"/>
              </svg>
            </div>
            
            <div className="error-boundary__content">
              <h1 className="error-boundary__title">
                Oops! Something went wrong
              </h1>
              
              <p className="error-boundary__message">
                We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <details className="error-boundary__details">
                  <summary>Error Details (Development Only)</summary>
                  <pre className="error-boundary__error">
                    {error && error.toString()}
                  </pre>
                  <pre className="error-boundary__stack">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="error-boundary__actions">
                <button 
                  className="btn btn-primary"
                  onClick={this.handleRetry}
                  disabled={retryCount >= 3}
                >
                  {retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
                </button>
                
                <button 
                  className="btn btn-secondary"
                  onClick={this.handleReload}
                >
                  Reload Page
                </button>
              </div>

              {retryCount > 0 && (
                <p className="error-boundary__retry-info">
                  Retry attempt: {retryCount}/3
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
