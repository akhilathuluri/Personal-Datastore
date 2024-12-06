import { Link, useLocation } from 'react-router-dom';
import { Files, Link as LinkIcon, FileText, Settings, Layout, Timer } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Layout },
  { name: 'Files', href: '/files', icon: Files },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Links', href: '/links', icon: LinkIcon },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Focus', href: '/focus', icon: Timer },
];

export default function Navigation() {
  const location = useLocation();
  const { theme, setTheme } = useStore();

  return (
    <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Personal Vault</h1>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  location.pathname === item.href
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="flex-shrink-0 w-full group block"
        >
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}