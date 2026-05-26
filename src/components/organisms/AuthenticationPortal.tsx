'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, AlertCircle, Loader2, Mail, Lock, Key } from 'lucide-react';
import { authService } from '@/lib/services/auth-service';
import { ApiError, apiClient } from '@/lib/api-client';

interface AuthenticationPortalProps {
  onLogin?: (email: string, password: string) => void;
  onRegister?: (fullName: string, email: string, password: string, plotNumber: number) => void;
}

export default function AuthenticationPortal({ onLogin, onRegister }: AuthenticationPortalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [requiresPasswordSetup, setRequiresPasswordSetup] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  
  // Register form state
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPlotNumber, setRegisterPlotNumber] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setEmailCheckLoading(true);

    try {
      const data = await apiClient.post<{ email: string; name: string; hasPassword: boolean; requiresPasswordSetup: boolean }>('/api/auth/check-email', {
        email: loginEmail,
      });

      setEmailVerified(true);
      setRequiresPasswordSetup(data.requiresPasswordSetup || false);
    } catch (error) {
      console.error('Email check error:', error);
      
      if (error instanceof ApiError) {
        setLoginError(error.message || 'Email not found');
      } else if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError('Failed to verify email. Please try again.');
      }
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await apiClient.post<{ message: string }>('/api/auth/set-password', {
        email: loginEmail,
        password: loginPassword,
      });

      // Password set successfully, now log in
      const result = await authService.signIn({
        email: loginEmail,
        password: loginPassword,
      });

      if (result.success) {
        router.push(result.url || '/dashboard');
        router.refresh();
      } else {
        setLoginError(result.error || 'Login failed after password setup.');
      }
    } catch (error) {
      console.error('Password setup error:', error);
      
      if (error instanceof ApiError) {
        setLoginError(error.message || 'Failed to set password');
      } else if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const result = await authService.signIn({
        email: loginEmail,
        password: loginPassword,
      });

      if (result.success) {
        router.push(result.url || '/dashboard');
        router.refresh();
      } else {
        setLoginError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof ApiError) {
        setLoginError(error.message || 'Login failed');
      } else if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterLoading(true);

    try {
      await authService.signUp({
        name: registerFullName,
        email: registerEmail,
        password: registerPassword,
            plotNumber: registerPlotNumber,
      });

      setRegisterSuccess(true);
      // Auto-switch to login tab after 2 seconds
      setTimeout(() => {
        setActiveTab('login');
        setLoginEmail(registerEmail);
        setRegisterSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof ApiError) {
        // Handle validation errors with detailed messages
        if (error.validationErrors && error.validationErrors.length > 0) {
          const errorMessages = error.validationErrors
            .map(e => `${e.field}: ${e.message}`)
            .join('; ');
          setRegisterError(errorMessages);
        } else {
          setRegisterError(error.message || 'Registration failed');
        }
      } else if (error instanceof Error) {
        setRegisterError(error.message);
      } else {
        setRegisterError('An unexpected error occurred during registration. Please try again.');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-2">
            GDV Resident Hub
          </h1>
          <p className="text-slate-400 text-sm">
            Community Management Portal
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 p-1 bg-slate-900/50 rounded-lg border border-slate-800/40">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-300 ease-in-out ${
              activeTab === 'login'
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4 inline-block mr-2" />
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-300 ease-in-out ${
              activeTab === 'register'
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4 inline-block mr-2" />
            Register Account
          </button>
        </div>

        {/* Login Form - Smart Email-First Flow */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{loginError}</span>
              </div>
            )}
            
            {/* Step 1: Email Verification */}
            {!emailVerified && (
              <form onSubmit={handleEmailCheck} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                    placeholder="your.email@example.com"
                    required
                    disabled={emailCheckLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={emailCheckLoading}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {emailCheckLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying email...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Continue
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Password Setup (if no password exists) */}
            {emailVerified && requiresPasswordSetup && (
              <form onSubmit={handlePasswordSetup} className="space-y-4">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center gap-2 text-cyan-400">
                  <Key className="w-4 h-4" />
                  <span className="text-sm">Please set up your password to continue</span>
                </div>
                <div>
                  <label htmlFor="login-email-display" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="login-email-display"
                    type="email"
                    value={loginEmail}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-400 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor="setup-password" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    Create Password
                  </label>
                  <input
                    id="setup-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                    required
                    disabled={loginLoading}
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-slate-400 font-medium">Password requirements:</p>
                    <ul className="text-xs text-slate-500 space-y-0.5 ml-3">
                      <li className="flex items-center gap-1">
                        <span className="text-cyan-400">•</span> At least 8 characters long
                      </li>
                      <li className="flex items-center gap-1">
                        <span className="text-cyan-400">•</span> One uppercase letter (A-Z)
                      </li>
                      <li className="flex items-center gap-1">
                        <span className="text-cyan-400">•</span> One lowercase letter (a-z)
                      </li>
                      <li className="flex items-center gap-1">
                        <span className="text-cyan-400">•</span> One number (0-9)
                      </li>
                      <li className="flex items-center gap-1">
                        <span className="text-cyan-400">•</span> One special character (@$!%*?&#)
                      </li>
                    </ul>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up password...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Set Password & Sign In
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailVerified(false);
                    setRequiresPasswordSetup(false);
                    setLoginPassword('');
                  }}
                  className="w-full text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ← Use different email
                </button>
              </form>
            )}

            {/* Step 3: Normal Login (if password exists) */}
            {emailVerified && !requiresPasswordSetup && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-email-display" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="login-email-display"
                    type="email"
                    value={loginEmail}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-400 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                    required
                    disabled={loginLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailVerified(false);
                    setLoginPassword('');
                  }}
                  className="w-full text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ← Use different email
                </button>
              </form>
            )}
          </div>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {registerError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{registerError}</span>
              </div>
            )}
            {registerSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Registration successful! Redirecting to login...</span>
              </div>
            )}
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                value={registerFullName}
                onChange={(e) => setRegisterFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                placeholder="John Doe"
                required
                disabled={registerLoading}
              />
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                placeholder="your.email@example.com"
                required
                disabled={registerLoading}
              />
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                placeholder="••••••••"
                required
                disabled={registerLoading}
              />
              <div className="mt-2 space-y-1">
                <p className="text-xs text-slate-400 font-medium">Password requirements:</p>
                <ul className="text-xs text-slate-500 space-y-0.5 ml-3">
                  <li className="flex items-center gap-1">
                    <span className="text-cyan-400">•</span> At least 8 characters long
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="text-cyan-400">•</span> One uppercase letter (A-Z)
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="text-cyan-400">•</span> One lowercase letter (a-z)
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="text-cyan-400">•</span> One number (0-9)
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="text-cyan-400">•</span> One special character (@$!%*?&#)
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <label htmlFor="register-plot" className="block text-sm font-medium text-slate-300 mb-2">
                Target Plot Number
              </label>
              <input
                id="register-plot"
                type="text"
                value={registerPlotNumber}
                onChange={(e) => setRegisterPlotNumber(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter plot number"
                required
                disabled={registerLoading}
              />
              <p className="text-xs text-slate-500 mt-1">
                Plot size will be automatically assigned based on master registry
              </p>
            </div>
            <button
              type="submit"
              disabled={registerLoading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {registerLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
