import React from "react";

interface MediaErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface MediaErrorBoundaryState {
  hasError: boolean;
}

class MediaErrorBoundary extends React.Component<
  MediaErrorBoundaryProps,
  MediaErrorBoundaryState
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("MediaErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center space-y-4 p-4">
              <div className="text-4xl md:text-6xl">⚠️</div>
              <p className="text-base md:text-lg">Media unavailable</p>
              <p className="text-xs md:text-sm text-gray-400">
                Failed to render media
              </p>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default MediaErrorBoundary;
