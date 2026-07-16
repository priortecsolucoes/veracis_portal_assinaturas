'use client';

import { useStore } from '@/lib/store';
import LoginPage from './LoginPage';
import AppShell from './AppShell';
import TabletMode from './TabletMode';
import Toast from './Toast';

export default function PortalApp() {
  const { isLoggedIn, tabletMode } = useStore();

  return (
    <>
      {!isLoggedIn && <LoginPage />}
      {isLoggedIn && tabletMode !== 'off' && <TabletMode />}
      {isLoggedIn && tabletMode === 'off' && <AppShell />}
      <Toast />
    </>
  );
}
