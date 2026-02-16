import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import { getSessionToken, setSessionToken, clearSessionToken } from '../utils/sessionToken';

export interface User {
  username: string;
  displayName: string;
  avatar?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  displayName: string;
  password: string;
}

export function useSessionAuth() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionToken = getSessionToken();
  const isAuthenticated = !!sessionToken && !!currentUser;

  // Validate session and fetch user on mount
  useEffect(() => {
    const validateAndFetchUser = async () => {
      if (!actor || !sessionToken) {
        setIsLoading(false);
        setCurrentUser(null);
        return;
      }

      try {
        // TODO: Call backend validateSession method when available
        // For now, assume token is valid if it exists
        // const principal = await actor.validateSession(sessionToken);
        // if (!principal) {
        //   clearSessionToken();
        //   setCurrentUser(null);
        //   setIsLoading(false);
        //   return;
        // }

        // TODO: Fetch user profile using session token
        // const profile = await actor.getCallerUserProfile();
        // if (profile) {
        //   setCurrentUser({
        //     username: sessionToken.slice(0, 8),
        //     displayName: profile.displayName,
        //     avatar: profile.avatar?.getDirectURL(),
        //   });
        // }
        
        // Temporary: Set a placeholder user if token exists
        setCurrentUser({
          username: sessionToken.slice(0, 8),
          displayName: 'User',
          avatar: undefined,
        });
      } catch (err) {
        console.error('Session validation error:', err);
        clearSessionToken();
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateAndFetchUser();
  }, [actor, sessionToken]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setError(null);
    setIsLoading(true);
    try {
      if (!actor) throw new Error('Backend not available');
      
      // TODO: Call backend login method when available
      // const result = await actor.login(credentials.username, credentials.password);
      // if ('Err' in result) {
      //   throw new Error(result.Err);
      // }
      // const token = result.Ok;
      
      // Temporary: Generate a mock token
      const token = `session_${credentials.username}_${Date.now()}`;
      
      setSessionToken(token);
      setCurrentUser({
        username: credentials.username,
        displayName: credentials.username,
        avatar: undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData): Promise<void> => {
    setError(null);
    setIsLoading(true);
    try {
      if (!actor) throw new Error('Backend not available');
      
      // TODO: Call backend signup method when available
      // const result = await actor.signup(data.username, data.displayName, data.password);
      // if ('Err' in result) {
      //   throw new Error(result.Err);
      // }
      // const token = result.Ok;
      
      // Temporary: Generate a mock token
      const token = `session_${data.username}_${Date.now()}`;
      
      setSessionToken(token);
      setCurrentUser({
        username: data.username,
        displayName: data.displayName,
        avatar: undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    try {
      if (actor && sessionToken) {
        // TODO: Call backend logout method when available
        // await actor.logout(sessionToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearSessionToken();
      setCurrentUser(null);
      queryClient.clear();
    }
  };

  const fetchCurrentUser = async (): Promise<void> => {
    // User is fetched automatically in useEffect
  };

  return {
    isAuthenticated,
    currentUser,
    isLoading,
    error,
    login,
    signup,
    logout,
    fetchCurrentUser,
  };
}
