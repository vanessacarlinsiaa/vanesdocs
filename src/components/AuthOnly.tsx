import type { ReactNode } from "react";
import { useAuth } from "../lib/auth";

export default function AuthOnly({ children }: { children: ReactNode }) {
  const user = useAuth();
  if (!user) return null;
  return <>{children}</>;
}
