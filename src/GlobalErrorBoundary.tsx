// src/GlobalErrorBoundary.tsx
import { Component, type ReactNode } from "react";
export default class GlobalErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; msg?: string }
> {
  state = { hasError: false as boolean, msg: undefined as string | undefined };
  static getDerivedStateFromError(e: unknown) {
    return { hasError: true, msg: e instanceof Error ? e.message : String(e) };
  }
  render() {
    return this.state.hasError ? (
      <main style={{ padding: 16 }}>
        <h3>App crashed</h3>
        <pre>{this.state.msg}</pre>
      </main>
    ) : (
      this.props.children
    );
  }
}
