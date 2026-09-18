import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode; moduleName?: string },
  State
> {
  constructor(props: { children: React.ReactNode; moduleName?: string }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AdminErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-500">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
          <div className="text-center">
            <p className="font-semibold text-gray-700">
              Erro ao carregar o módulo {this.props.moduleName && `"${this.props.moduleName}"`}
            </p>
            <p className="text-xs mt-1 text-gray-400 max-w-sm">{this.state.errorMessage}</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            className="flex items-center gap-2 text-xs bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
