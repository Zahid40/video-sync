"use client";

import { UserType } from "@/types/type";
import {
  createContext,
  useContext,
  useState,
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
  const [user, setUser] = useState<UserType>(initialUser);

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