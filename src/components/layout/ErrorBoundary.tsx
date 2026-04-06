"use client";

import { Component } from "react";
import type { ReactNode } from "react";

interface ErrorBoundaryProps {
  /** Content to render when no error has occurred */
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render errors in child components and displays a recovery UI.
 * Prevents a single tool crash from taking down the entire page.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  // componentDidCatch is available for error reporting services if needed.

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center">
          <p className="text-lg font-medium text-red-400">
            Something went wrong
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            This tool encountered an unexpected error. Try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 rounded-lg border border-white/10 bg-white/[0.05] px-5 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
