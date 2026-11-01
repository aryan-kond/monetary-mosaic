import { ApiError } from '../api/client';

export type AuthMode = 'signin' | 'signup';

export interface FieldErrors {
  email?: string;
  password?: string;
  confirm?: string;
}

/** A message that applies to the whole form, such as "the email or password is incorrect". */
export interface FormMessage {
  title: string;
  text: string;
}

export interface AuthFailure {
  fields: FieldErrors;
  form: FormMessage | null;
}

export const MIN_PASSWORD_LENGTH = 8;
/** A generous limit, so very long passphrases work but nobody can send something enormous. */
export const MAX_PASSWORD_LENGTH = 128;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Checks the form before anything is sent. The server checks everything again. */
export function validateCredentials(
  mode: AuthMode,
  email: string,
  password: string,
  confirm: string,
): FieldErrors {
  const errors: FieldErrors = {};
  const trimmed = email.trim();

  if (trimmed === '') errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(trimmed)) {
    errors.email = 'Enter a valid email address, for example name@example.com.';
  }

  if (password === '') {
    errors.password = mode === 'signin' ? 'Enter your password.' : 'Choose a password.';
  } else if (mode === 'signup') {
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    } else if (password.length > MAX_PASSWORD_LENGTH) {
      errors.password = `Use ${MAX_PASSWORD_LENGTH} characters or fewer.`;
    }
  }

  if (mode === 'signup') {
    if (confirm === '') errors.confirm = 'Confirm your password.';
    else if (confirm !== password) errors.confirm = 'Passwords do not match.';
  }

  return errors;
}

const GENERIC: FormMessage = {
  title: 'Something went wrong',
  text: 'Please try again in a moment.',
};

/** Turns whatever went wrong into words for the person, and the field it belongs to. */
export function describeAuthError(error: unknown): AuthFailure {
  if (!(error instanceof ApiError)) return { fields: {}, form: GENERIC };

  switch (error.code) {
    case 'invalid_credentials':
      return {
        fields: {},
        // The same message whether the email or the password was wrong, so it reveals nothing.
        form: {
          title: 'We could not sign you in',
          text: 'The email or password is incorrect. Check them and try again.',
        },
      };
    case 'email_taken':
      return {
        fields: { email: 'An account with this email already exists. Try signing in instead.' },
        form: null,
      };
    case 'validation': {
      const fields: FieldErrors = {};
      if (error.fields.email) fields.email = error.fields.email;
      if (error.fields.password) fields.password = error.fields.password;
      return Object.keys(fields).length > 0 ? { fields, form: null } : { fields, form: GENERIC };
    }
    case 'too_many_attempts':
      return {
        fields: {},
        form: {
          title: 'Too many attempts',
          text: error.retryAfterSeconds
            ? `Please wait ${error.retryAfterSeconds} seconds before trying again.`
            : 'Please wait a moment before trying again.',
        },
      };
    case 'network':
      return { fields: {}, form: { title: 'We could not reach the server', text: error.message } };
    default:
      return { fields: {}, form: { title: 'Something went wrong', text: error.message } };
  }
}
