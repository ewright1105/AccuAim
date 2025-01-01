// AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the type for the user object
interface User {
  id: string;
  email: string;
  name: string;
}

// Define the type for the context
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUserName: (name: string) => void;
}

// Create the AuthContext with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to access the Auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


// AuthProvider component to wrap the app and provide the auth context
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };
  const updateUserName = (name: string) => {
    setUser((prevUser) => {
      if (prevUser) {
        return { ...prevUser, name };
      }
      return prevUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserName }}>
      {children}
    </AuthContext.Provider>
  );
};

