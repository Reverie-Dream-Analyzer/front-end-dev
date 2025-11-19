'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { loginUser, registerUser } from '@/lib/api/auth';

type FormState = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

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

    if (!isSignIn && password !== confirmPassword) {
      setFormError('Passwords do not match. Try again.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (isSignIn) {
        // 🔐 SIGN IN → Flask
        const res = await loginUser(email, password);
        console.log("Backend login response:", res);

        await login(email, password, { requireProfileSetup: false });

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
                  className="block w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
                />
              </div>
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
