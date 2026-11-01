import { useRef, useState, type FormEvent } from 'react';
import { Button } from '../../components/Button/Button';
import { CheckboxField } from '../../components/Field/CheckboxField';
import { PasswordField } from '../../components/Field/PasswordField';
import { TextField } from '../../components/Field/TextField';
import { Logo } from '../../components/Logo/Logo';
import {
  describeAuthError,
  MIN_PASSWORD_LENGTH,
  validateCredentials,
  type AuthMode,
  type FieldErrors,
  type FormMessage,
} from '../../utils/authValidation';
import './AuthPage.css';

interface Credentials {
  email: string;
  password: string;
}

interface AuthPageProps {
  /** Each should throw an ApiError when the server says no. */
  onSignIn: (credentials: Credentials) => Promise<void>;
  onSignUp: (credentials: Credentials) => Promise<void>;
}

export function AuthPage({ onSignIn, onSignUp }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState<FormMessage | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const isSignUp = mode === 'signup';

  const clearError = (field: keyof FieldErrors) =>
    setErrors((current) => ({ ...current, [field]: undefined }));

  /** Moves focus to the first field with a problem, or to the message about the whole form. */
  const focusProblem = () =>
    requestAnimationFrame(() => {
      const field = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      (field ?? alertRef.current)?.focus();
    });

  const switchMode = () => {
    setMode(isSignUp ? 'signin' : 'signup');
    setPassword('');
    setConfirm('');
    setShowPassword(false);
    setErrors({});
    setFormMessage(null);
    // Announce the new screen by moving focus to its heading.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const found = validateCredentials(mode, email, password, confirm);
    setErrors(found);
    setFormMessage(null);
    if (Object.keys(found).length > 0) {
      focusProblem();
      return;
    }

    setSubmitting(true);
    try {
      // The confirm password is only checked here. It is never sent anywhere.
      await (isSignUp ? onSignUp : onSignIn)({ email: email.trim(), password });
    } catch (error) {
      const failure = describeAuthError(error);
      setErrors(failure.fields);
      setFormMessage(failure.form);
      setSubmitting(false);
      focusProblem();
    }
  };

  return (
    <main className="auth">
      <div className="auth__card">
        <div className="auth__logo">
          <Logo variant="full" height={56} />
        </div>

        <h1 ref={headingRef} tabIndex={-1} className="auth__title">
          {isSignUp ? 'Create your account' : 'Sign in'}
        </h1>
        <p className="auth__intro">
          {isSignUp
            ? 'Choose an email and a password to get started.'
            : 'Welcome back. Sign in to see your finances.'}
        </p>

        {formMessage && (
          <div ref={alertRef} tabIndex={-1} role="alert" className="auth-alert">
            <p className="auth-alert__title">{formMessage.title}</p>
            <p>{formMessage.text}</p>
          </div>
        )}

        <form ref={formRef} className="auth__form" noValidate onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            shape="pill"
            autoComplete={isSignUp ? 'email' : 'username'}
            value={email}
            error={errors.email}
            onChange={(value) => {
              setEmail(value);
              clearError('email');
            }}
          />

          <PasswordField
            label="Password"
            name="password"
            shape="pill"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            revealed={showPassword}
            hint={isSignUp ? `At least ${MIN_PASSWORD_LENGTH} characters` : undefined}
            error={errors.password}
            value={password}
            onChange={(value) => {
              setPassword(value);
              clearError('password');
            }}
          />

          {isSignUp && (
            <PasswordField
              label="Confirm password"
              name="confirm-password"
              shape="pill"
              autoComplete="new-password"
              revealed={showPassword}
              error={errors.confirm}
              value={confirm}
              onChange={(value) => {
                setConfirm(value);
                clearError('confirm');
              }}
            />
          )}

          <div className="auth__reveal">
            <CheckboxField
              label={isSignUp ? 'Show passwords' : 'Show password'}
              checked={showPassword}
              onChange={setShowPassword}
            />
          </div>

          <Button
            type="submit"
            className="auth__submit"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting
              ? isSignUp
                ? 'Creating your account…'
                : 'Signing in…'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </Button>
        </form>

        <p className="auth__switch">
          {isSignUp ? 'Already have an account? ' : 'New to Monetary Mosaic? '}
          <button type="button" className="link-button" onClick={switchMode}>
            {isSignUp ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </main>
  );
}
