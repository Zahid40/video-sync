"use client";

import { UserType } from "@/types/type";
import { useAuth } from "@/hooks/auth";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

// Define the context shape
type UserContextType = {
  user: UserType;
  setUser: Dispatch<SetStateAction<UserType>>;
};

// Create context with undefined initial value (to force correct use within provider)
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider = ({
  initialUser,
  children,
}: {
  initialUser: UserType;
  children: ReactNode;
}) => {
  const { user: authUser, profile, loading } = useAuth();
  const [user, setUser] = useState<UserType>(initialUser);

  useEffect(() => {
    if (loading) return;

    if (!authUser) {
      setUser({} as UserType);
      return;
    }

    setUser({
      ...profile,
      username: profile?.display_name || "",
      ...authUser,
    } as UserType);
  }, [authUser, profile, loading]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to access user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context; // fully typed with { user: UserType; setUser: ... }
};