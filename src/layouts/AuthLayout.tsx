import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center surface-base px-4 py-10">
      <main className="w-full max-w-md">
        <Outlet />
      </main>
    </div>
  );
}
