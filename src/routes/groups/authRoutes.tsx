import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AccessDeniedPage } from '@/features/auth/pages/AccessDeniedPage';
import { AccountLockedPage } from '@/features/auth/pages/AccountLockedPage';
import { AuthEntryRedirect } from '@/features/auth/pages/AuthEntryRedirect';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { MfaPage } from '@/features/auth/pages/MfaPage';
import { GoogleAuthCallbackPage } from '@/features/auth/pages/GoogleAuthCallbackPage';
import { ForgotPasswordOtpPage, ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage';
import { PublicRoute } from '@/routes/PublicRoute';

const publicAuthChildren: RouteObject[] = [
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/forgot-password/verify', element: <ForgotPasswordOtpPage /> },
  { path: '/reset-password/:token', element: <Navigate to="/forgot-password" replace /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/auth/google/callback', element: <GoogleAuthCallbackPage /> },
  { path: '/mfa', element: <MfaPage /> },
  { path: '/session-expired', element: <Navigate to="/" replace /> },
  { path: '/account-locked', element: <AccountLockedPage /> },
];

export const authRoutes: RouteObject[] = [
  // Legacy deep-links → homepage shared AuthModal (no AuthCard login/register pages).
  { path: '/login', element: <AuthEntryRedirect view="login" /> },
  { path: '/register', element: <AuthEntryRedirect view="signup" /> },
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: publicAuthChildren,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [{ path: '/access-denied', element: <AccessDeniedPage /> }],
  },
];
