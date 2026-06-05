import React from 'react';
import { Router, AuthProvider, ToastProvider, useAuth, useRoute } from './lib/context.jsx';
import { SignIn } from './screens/SignIn.jsx';
import { Callback } from './screens/Callback.jsx';
import { Landing } from './screens/Landing.jsx';
import { Create, Join, Invite } from './screens/CreateJoinInvite.jsx';
import { Group } from './screens/Group.jsx';

function Routes() {
  const { user } = useAuth();
  const { path } = useRoute();

  if (!user) {
    if (path.startsWith('/auth/callback')) return <Callback />;
    return <SignIn />;
  }

  if (path === '/' || path === '') return <Landing />;
  if (path === '/join') return <Join />;
  if (path === '/create') return <Create />;
  if (path.startsWith('/invite/')) return <Invite />;
  if (path.startsWith('/group/')) return <Group />;
  if (path.startsWith('/auth/callback')) return <Callback />;

  return <Landing />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
