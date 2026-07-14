import type { RouteObject } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AccessDeniedPage } from '@/features/auth/pages/AccessDeniedPage';
import { AccountLockedPage } from '@/features/auth/pages/AccountLockedPage';
import { AuthEntryRedirect } from '@/features/auth/pages/AuthEntryRedirect';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { MfaPage } from '@/features/auth/pages/MfaPage';
import { ForgotPasswordOtpPage, ResetPasswordByTokenPage, ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { SessionExpiredPage } from '@/features/auth/pages/SessionExpiredPage';
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage';
import { PublicRoute } from '@/routes/PublicRoute';

const publicAuthChildren: RouteObject[] = [
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/forgot-password/verify', element: <ForgotPasswordOtpPage /> },
  { path: '/reset-password/:token', element: <ResetPasswordByTokenPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/mfa', element: <MfaPage /> },
  { path: '/session-expired', element: <SessionExpiredPage /> },
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
