import { Outlet } from 'react-router-dom';

export function FullscreenLayout() {
  return (
    <div className="min-h-screen surface-page">
      <Outlet />
    </div>
  );
}
