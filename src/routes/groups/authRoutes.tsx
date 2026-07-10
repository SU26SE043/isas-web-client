import type { RouteObject } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { MfaPage } from '@/features/auth/pages/MfaPage';
import { ForgotPasswordOtpPage, ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage';
import { PublicRoute } from '@/routes/PublicRoute';

export const authRoutes: RouteObject[] = [
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/verify-email', element: <VerifyEmailPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/forgot-password/verify', element: <ForgotPasswordOtpPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
          { path: '/mfa', element: <MfaPage /> },
        ],
      },
    ],
  },
];
