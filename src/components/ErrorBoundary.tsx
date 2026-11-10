import { Component, ErrorInfo, ReactNode } from "react";
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from "@heroicons/react/24/outline";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled application error:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[500px] flex items-center justify-center p-4 sm:p-8 font-poppins">
          <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ExclamationTriangleIcon className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Something went wrong
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                An unexpected interface issue occurred. You can reload the section or navigate back to the store safely.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-gray-50 rounded-xl text-left border border-gray-200/80">
                <p className="text-[11px] font-mono text-gray-600 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F2BC00] text-gray-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-xs"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <a
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs sm:text-sm rounded-xl transition no-underline"
              >
                <HomeIcon className="w-4 h-4" />
                <span>Home Page</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
