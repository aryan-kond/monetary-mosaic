import { ApiError, request } from './client';

export interface User {
  id: string;
  email: string;
}

interface UserResponse {
  user: User;
}

/** The signed-in person, or null when nobody is signed in. Other failures are thrown. */
export async function fetchSession(): Promise<User | null> {
  try {
    const { user } = await request<UserResponse>('/auth/me');
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  const { user } = await request<UserResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  return user;
}

export async function signUp(email: string, password: string): Promise<User> {
  const { user } = await request<UserResponse>('/auth/signup', {
    method: 'POST',
    body: { email, password },
  });
  return user;
}

export async function signOut(): Promise<void> {
  await request<void>('/auth/logout', { method: 'POST' });
}
