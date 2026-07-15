import { Navigate, useLocation } from 'react-router-dom';

type AuthEntryView = 'login' | 'signup';

interface AuthEntryRedirectProps {
  view: AuthEntryView;
}

/** Deep-link `/login` | `/register` → homepage AuthModal (`?auth=`). */
export function AuthEntryRedirect({ view }: AuthEntryRedirectProps) {
  const location = useLocation();
  const reason = (location.state as { reason?: string } | null)?.reason;
  const params = new URLSearchParams({ auth: view });
  if (reason) {
    params.set('reason', reason);
  }

  return (
    <Navigate
      to={{ pathname: '/', search: `?${params.toString()}` }}
      state={location.state}
      replace
    />
  );
}
