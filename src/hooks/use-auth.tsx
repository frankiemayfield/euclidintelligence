import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type BuilderSubtype = "GC" | "Builder" | "Remodeler" | "Developer";
export type AccountTrack = "subcontractor" | "builder";

export interface AuthUser {
  email: string;
  name?: string;
  companyName?: string;
  accountTrack: AccountTrack;
  builderSubtype?: BuilderSubtype;
  primaryTrade?: string;
  region?: string;
  isFirstRun: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => void;
  demoSignIn: (track: "sub" | "builder") => void;
}

export interface SignUpData {
  email: string;
  password: string;
  companyName: string;
  name?: string;
  region?: string;
  accountTrack: AccountTrack;
  builderSubtype?: BuilderSubtype;
  primaryTrade?: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
  demoSignIn: () => {},
});

const STORAGE_KEY = "bedrock-auth-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const signIn = useCallback(async (email: string, _password: string) => {
    // Mock: look up stored user by email, or create a minimal one
    const stored = localStorage.getItem(`bedrock-account-${email}`);
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      // No stored account – they need to pick account type
      setUser({
        email,
        accountTrack: "builder",
        isFirstRun: true,
      });
    }
  }, []);

  const signUp = useCallback(async (data: SignUpData) => {
    const newUser: AuthUser = {
      email: data.email,
      name: data.name,
      companyName: data.companyName,
      accountTrack: data.accountTrack,
      builderSubtype: data.builderSubtype,
      primaryTrade: data.primaryTrade,
      region: data.region,
      isFirstRun: true,
    };
    localStorage.setItem(`bedrock-account-${data.email}`, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const demoSignIn = useCallback((track: "sub" | "builder") => {
    if (track === "sub") {
      setUser({
        email: "demo@trueframe.com",
        name: "Alex Rivera",
        companyName: "TrueFrame Carpentry",
        accountTrack: "subcontractor",
        primaryTrade: "Framing",
        isFirstRun: false,
      });
    } else {
      setUser({
        email: "demo@mayfield.com",
        name: "Sarah Chen",
        companyName: "Mayfield & Co.",
        accountTrack: "builder",
        builderSubtype: "GC",
        isFirstRun: false,
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signUp, signOut, demoSignIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
