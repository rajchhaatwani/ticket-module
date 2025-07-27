import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, Organizer, LoginCredentials, SignupData } from '../types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: Organizer; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: Organizer; token: string } };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'RESTORE_SESSION':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Restore session from localStorage
    const token = localStorage.getItem('ticket_token');
    const user = localStorage.getItem('ticket_user');
    
    if (token && user) {
      try {
        dispatch({
          type: 'RESTORE_SESSION',
          payload: { user: JSON.parse(user), token },
        });
      } catch (error) {
        localStorage.removeItem('ticket_token');
        localStorage.removeItem('ticket_user');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    const mockUser: Organizer = {
      _id: '1',
      name: 'John Organizer',
      email: credentials.email,
      created_at: new Date().toISOString(),
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    localStorage.setItem('ticket_token', mockToken);
    localStorage.setItem('ticket_user', JSON.stringify(mockUser));
    
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: mockUser, token: mockToken },
    });
  };

  const signup = async (data: SignupData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: Organizer = {
      _id: '1',
      name: data.name,
      email: data.email,
      created_at: new Date().toISOString(),
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    localStorage.setItem('ticket_token', mockToken);
    localStorage.setItem('ticket_user', JSON.stringify(mockUser));
    
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: mockUser, token: mockToken },
    });
  };

  const logout = () => {
    localStorage.removeItem('ticket_token');
    localStorage.removeItem('ticket_user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};