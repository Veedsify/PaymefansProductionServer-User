"use client";

import type React from "react";
import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary specifically for media preview modal
 * Prevents crashes from corrupted media or network issues
 */
class MediaPreviewErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("MediaPreviewModal Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-90">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Unable to load media
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                There was an error loading the media preview. Please try again.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-primary-dark-pink text-white rounded hover:bg-primary-text-dark-pink transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default MediaPreviewErrorBoundary;
