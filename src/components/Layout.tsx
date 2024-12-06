import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { useStore } from '@/lib/store';

export default function Layout() {
  const { theme } = useStore();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}