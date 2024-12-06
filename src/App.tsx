import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useStore } from '@/lib/store';
import Layout from '@/components/Layout';
import PrivateRoute from '@/components/PrivateRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Files from '@/pages/Files';
import Notes from '@/pages/Notes';
import Links from '@/pages/Links';
import Settings from '@/pages/Settings';
import Focus from '@/pages/Focus';

export default function App() {
  const { setUser, setLoading } = useStore();

  useEffect(() => {
    console.log('App mounted');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/files" element={<Files />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/links" element={<Links />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/focus" element={<Focus />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}