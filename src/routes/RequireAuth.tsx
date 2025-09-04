import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function RequireAuth({ children }: Props) {
  const user = useAuth();

  if (user === null) {
    return <main style={{ padding: 16 }}>Checking session…</main>;
  }
  return user ? <>{children}</> : <Navigate to="/" replace />;
}
