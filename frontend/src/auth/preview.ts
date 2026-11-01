import { ApiError } from '../api/client';

/** Open the app at /?preview-auth during development to see the sign-in screens without a backend. */
export const isAuthPreview =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('preview-auth');

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/** Pretends the server answered "wrong email or password". */
export async function previewSignIn(): Promise<void> {
  await wait(800);
  throw new ApiError(401, { code: 'invalid_credentials', message: 'Preview only.' });
}

/** Pretends the server answered "that email already has an account". */
export async function previewSignUp(): Promise<void> {
  await wait(800);
  throw new ApiError(409, { code: 'email_taken', message: 'Preview only.' });
}
