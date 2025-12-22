"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  // ✅ Demo mode: bypass Firebase completely
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    setUser(
      {
        uid: "demo-user",
        email: "demo@clinect.app",
        displayName: "Demo User",
      } as any
    );
    setLoading(false);
    return;
  }

  // Normal mode: Firebase auth
  let unsubscribe: any;

  (async () => {
    const { auth } = await import("./firebase");
    const { onAuthStateChanged } = await import("firebase/auth");

    unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  })();

  return () => unsubscribe?.();
}, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
