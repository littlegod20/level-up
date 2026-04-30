import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiLogin, apiRegister, type RegisterPayload } from '@/lib/api';

const TOKEN_KEY = 'levelup_access_token';
const EMAIL_KEY = 'levelup_user_email';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  token: string | null;
  email: string | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [savedToken, savedEmail] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(EMAIL_KEY),
      ]);
      if (!mounted) return;
      setToken(savedToken);
      setEmail(savedEmail);
      setStatus(savedToken ? 'authenticated' : 'unauthenticated');
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (nextToken: string, nextEmail: string) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, nextToken),
      SecureStore.setItemAsync(EMAIL_KEY, nextEmail),
    ]);
    setToken(nextToken);
    setEmail(nextEmail);
    setStatus('authenticated');
  }, []);

  const signIn = useCallback(async (inputEmail: string, password: string) => {
    const out = await apiLogin(inputEmail.trim(), password);
    await persist(out.accessToken, out.user.email);
  }, [persist]);

  const signUp = useCallback(async (payload: RegisterPayload) => {
    const out = await apiRegister({
      ...payload,
      email: payload.email.trim(),
    });
    await persist(out.accessToken, out.user.email);
  }, [persist]);

  const signOut = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(EMAIL_KEY),
    ]);
    setToken(null);
    setEmail(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    email,
    status,
    signIn,
    signUp,
    signOut,
  }), [email, signIn, signOut, signUp, status, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
