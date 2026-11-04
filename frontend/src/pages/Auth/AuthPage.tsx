import { useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '../../components/Button/Button';
import { CheckboxField } from '../../components/Field/CheckboxField';
import { PasswordField } from '../../components/Field/PasswordField';
import { TextField } from '../../components/Field/TextField';
import { Logo } from '../../components/Logo/Logo';
import { PasswordChecklist } from '../../components/PasswordChecklist/PasswordChecklist';
import { Tabs } from '../../components/Tabs/Tabs';
import {
  describeAuthError,
  MIN_PASSWORD_LENGTH,
  validateCredentials,
  type AuthMode,
  type FieldErrors,
  type FormMessage,
} from '../../utils/authValidation';
import './AuthPage.css';

const TABS: { id: AuthMode; label: string }[] = [
  { id: 'signin', label: 'Sign in' },
  { id: 'signup', label: 'Create account' },
];

const BENEFITS = [
  {
    title: 'Bring your own statements',
    text: 'Import a CSV from your bank. Nothing connects to your account.',
  },
  {
    title: 'Stay in control',
    text: 'Review and correct every category before it counts.',
  },
  {
    title: 'See what it means',
    text: 'Budgets, recurring payments, and trends in plain language.',
  },
];

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

  const panelId = useId();
  const titleId = `${panelId}-title`;
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const isSignUp = mode === 'signup';

  const clearError = (field: keyof FieldErrors) =>
    setErrors((current) => ({ ...current, [field]: undefined }));

  /** Moves focus to the first field with a problem, or to the message about the whole form. */
  const focusProblem = () =>
    requestAnimationFrame(() => {
      const field = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      (field ?? alertRef.current)?.focus();
    });

  const selectMode = (next: AuthMode) => {
    if (next === mode) return;
    setMode(next);
    // The email stays. Anything secret, and anything that went wrong, is cleared.
    setPassword('');
    setConfirm('');
    setShowPassword(false);
    setErrors({});
    setFormMessage(null);
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

  const passwordRules = [
    {
      id: 'length',
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      met: password.length >= MIN_PASSWORD_LENGTH,
    },
    { id: 'match', label: 'Both passwords match', met: password !== '' && password === confirm },
  ];

  return (
    <main className="auth">
      <div className="auth__shell">
        <section className="auth__main">
          {/* On narrow screens the brand panel is hidden, so the logo sits here instead. */}
          <div className="auth__logo-mobile">
            <Logo variant="full" height={64} />
          </div>

          <Tabs label="Account" tabs={TABS} value={mode} onChange={selectMode} panelId={panelId} />

          <div
            id={panelId}
            role="tabpanel"
            aria-labelledby={`${panelId}-tab-${mode}`}
            className="auth__body"
          >
            <header className="auth__header">
              <h1 id={titleId} className="auth__title">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="auth__intro">
                {isSignUp
                  ? 'Choose an email and a password to get started.'
                  : 'Sign in to see your finances.'}
              </p>
            </header>

            {formMessage && (
              <div ref={alertRef} tabIndex={-1} role="alert" className="auth-alert">
                <p className="auth-alert__title">{formMessage.title}</p>
                <p>{formMessage.text}</p>
              </div>
            )}

            <form
              ref={formRef}
              className="auth__form"
              noValidate
              aria-labelledby={titleId}
              onSubmit={handleSubmit}
            >
              <div className="auth__group">
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
              </div>

              <div className="auth__group">
                <PasswordField
                  label="Password"
                  name="password"
                  shape="pill"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  revealed={showPassword}
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

                {isSignUp && <PasswordChecklist rules={passwordRules} />}
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
          </div>
        </section>

        {/* After the form in the page, but shown on the left on wide screens. */}
        <aside className="auth__aside" aria-label="About Monetary Mosaic">
          <Logo variant="full" height={72} />
          <h2 className="auth__aside-title">A clearer view of your money</h2>
          <ul className="auth__benefits">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title}>
                <strong>{benefit.title}</strong>
                <span>{benefit.text}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
