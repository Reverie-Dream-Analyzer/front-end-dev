'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import { loginUser, registerUser } from '@/lib/api/auth';
import { Check, X } from 'lucide-react';

type FormState = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

// Validation helpers
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordValidation = {
  hasUppercase: (password: string) => /[A-Z]/.test(password),
  hasLowercase: (password: string) => /[a-z]/.test(password),
  hasNumberOrSymbol: (password: string) => /[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  hasMinLength: (password: string) => password.length >= 8,
};

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-red-400" />
      )}
      <span className={met ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
        {text}
      </span>
    </li>
  );
}

export default function SignIn() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formState, setFormState] = useState<FormState>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();

  // Password validation state (computed)
  const passwordChecks = useMemo(() => ({
    hasUppercase: passwordValidation.hasUppercase(formState.password),
    hasLowercase: passwordValidation.hasLowercase(formState.password),
    hasNumberOrSymbol: passwordValidation.hasNumberOrSymbol(formState.password),
    hasMinLength: passwordValidation.hasMinLength(formState.password),
  }), [formState.password]);

  const isPasswordValid = passwordChecks.hasUppercase && passwordChecks.hasLowercase && 
                          passwordChecks.hasNumberOrSymbol && passwordChecks.hasMinLength;
  
  const isEmailValid = emailRegex.test(formState.email);

  // Redirect once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.hasProfile) {
        router.replace('/dashboard');
      } else {
        router.replace('/auth/profile-setup');
      }
    }
  }, [isAuthenticated, router, user]);

  // Input handler
  const handleInputChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const resetForm = () => {
    setFormState({
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const { email, username, password, confirmPassword } = formState;

    if (!email || !password) {
      setFormError('Please enter both an email and a password.');
      return;
    }

    // Email format validation
    if (!isEmailValid) {
      setFormError('Please enter a valid email address.');
      return;
    }

    // Sign-up specific validations
    if (!isSignIn) {
      if (!username.trim()) {
        setFormError('Please enter a username.');
        return;
      }

      if (!isPasswordValid) {
        setFormError('Please meet all password requirements.');
        return;
      }

      if (password !== confirmPassword) {
        setFormError('Passwords do not match. Try again.');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      if (isSignIn) {
        // 🔐 SIGN IN → Flask
        const res = await loginUser(email, password);
        console.log("Backend login response:", res);

        await login({ 
          id: res.user?.id,
          email, 
          token: res.token, 
          requireProfileSetup: false,
          backendProfile: res.user ? {
            has_profile: res.user.has_profile,
            birthdate: res.user.birthdate,
            favorite_element: res.user.favorite_element,
            dream_goals: res.user.dream_goals,
          } : undefined,
        });

      } else {
        // 🆕 SIGN UP → Flask
        const res = await registerUser(email, password, username);
        console.log("Backend register response:", res);

        // Flip back to sign-in mode
        setIsSignIn(true);
      }

      resetForm();

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to reach the server. Make sure Flask is running.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {isSignIn ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignIn(!isSignIn)}
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {isSignIn ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            
            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formState.email}
                  onChange={handleInputChange('email')}
                  className={`block w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white ${
                    formState.email && !isEmailValid ? 'border-red-400' : ''
                  }`}
                />
              </div>
              {formState.email && !isEmailValid && (
                <p className="mt-1 text-sm text-red-500">Please enter a valid email (e.g., user@example.com)</p>
              )}
            </div>

            {/* USERNAME (only for sign up) */}
            {!isSignIn && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formState.username}
                    onChange={handleInputChange('username')}
                    className="block w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* PASSWORD */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formState.password}
                  onChange={handleInputChange('password')}
                  className="block w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              </div>
              {/* Password requirements (only show during sign up) */}
              {!isSignIn && formState.password && (
                <ul className="mt-3 space-y-1">
                  <PasswordRequirement met={passwordChecks.hasMinLength} text="At least 8 characters" />
                  <PasswordRequirement met={passwordChecks.hasUppercase} text="One uppercase letter" />
                  <PasswordRequirement met={passwordChecks.hasLowercase} text="One lowercase letter" />
                  <PasswordRequirement met={passwordChecks.hasNumberOrSymbol} text="One number or symbol" />
                </ul>
              )}
            </div>

            {/* CONFIRM PASSWORD (sign up only) */}
            {!isSignIn && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formState.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    className="block w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* ERRORS */}
            {formError && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {formError}
              </p>
            )}

            {/* SUBMIT */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md bg-indigo-600 py-2 px-4 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {isSubmitting ? 'Please wait...' : isSignIn ? 'Sign in' : 'Create account'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
