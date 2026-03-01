import { useState, useEffect, useCallback } from 'react';
import { getSessionToken, setSessionToken, clearSessionToken } from '../utils/sessionToken';

interface SessionUser {
  username: string;
  displayName: string;
  token: string;
}

interface SessionAuthState {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface SignupCredentials {
  username: string;
  displayName: string;
  password: string;
}

// Simple in-memory user store for demo purposes
// In production this would be backed by the canister's session auth
const USERS_KEY = 'diniverse_users';

function getStoredUsers(): Record<string, { displayName: string; passwordHash: string }> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function storeUser(username: string, displayName: string, passwordHash: string) {
  const users = getStoredUsers();
  users[username] = { displayName, passwordHash };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Simple hash function for demo (not cryptographically secure)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function generateToken(username: string): string {
  return `${username}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function useSessionAuth() {
  const [state, setState] = useState<SessionAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = getSessionToken();
    if (token) {
      try {
        // Token format: username_timestamp_random
        const username = token.split('_')[0];
        const users = getStoredUsers();
        if (users[username]) {
          setState({
            user: { username, displayName: users[username].displayName, token },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        }
      } catch {
        clearSessionToken();
      }
    }
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const users = getStoredUsers();
      const user = users[credentials.username];
      if (!user) {
        throw new Error('Invalid username or password');
      }
      const hash = simpleHash(credentials.password);
      if (user.passwordHash !== hash) {
        throw new Error('Invalid username or password');
      }
      const token = generateToken(credentials.username);
      setSessionToken(token);
      setState({
        user: { username: credentials.username, displayName: user.displayName, token },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
      throw err;
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const users = getStoredUsers();
      if (users[credentials.username]) {
        throw new Error('Username already taken');
      }
      if (credentials.username.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }
      if (credentials.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      const passwordHash = simpleHash(credentials.password);
      storeUser(credentials.username, credentials.displayName || credentials.username, passwordHash);
      const token = generateToken(credentials.username);
      setSessionToken(token);
      setState({
        user: {
          username: credentials.username,
          displayName: credentials.displayName || credentials.username,
          token,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
      throw err;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    clearSessionToken();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    const token = getSessionToken();
    if (!token) throw new Error('Not authenticated');

    const username = token.split('_')[0];
    const users = getStoredUsers();
    const user = users[username];
    if (!user) throw new Error('User not found');

    if (newPassword !== confirmPassword) {
      throw new Error('New passwords do not match');
    }
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    const currentHash = simpleHash(currentPassword);
    if (user.passwordHash !== currentHash) {
      throw new Error('Current password is incorrect');
    }

    const newHash = simpleHash(newPassword);
    storeUser(username, user.displayName, newHash);
  }, []);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    signup,
    logout,
    changePassword,
  };
}
