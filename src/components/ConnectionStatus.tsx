import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { useStore } from '@/lib/store';
import { Wifi, WifiOff, Database, Shield } from 'lucide-react';
import { collection, doc, onSnapshot } from 'firebase/firestore';

export default function ConnectionStatus() {
  const { user } = useStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dbConnection, setDbConnection] = useState<'connected' | 'disconnected'>('disconnected');

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor Firestore connection
  useEffect(() => {
    // Create a test document reference to monitor connection
    const connectionRef = doc(collection(db, '_connection_test_'), 'test');
    
    const unsubscribe = onSnapshot(
      connectionRef,
      () => {
        setDbConnection('connected');
      },
      (error) => {
        console.error('Firestore connection error:', error);
        setDbConnection('disconnected');
      }
    );

    // Set initial connection status
    setDbConnection('connected');

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        System Status
      </h3>
      
      <div className="space-y-3">
        {/* Network Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-300">Network</span>
          </div>
          <span className={`text-sm ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
            {isOnline ? 'Connected' : 'Offline'}
          </span>
        </div>

        {/* Database Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className={`h-5 w-5 ${dbConnection === 'connected' ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-300">Database</span>
          </div>
          <span className={`text-sm ${dbConnection === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
            {dbConnection === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Firebase Config */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Firebase Configuration
          </h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Project ID: <span className="font-mono text-xs">{import.meta.env.VITE_FIREBASE_PROJECT_ID}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Auth Domain: <span className="font-mono text-xs">{import.meta.env.VITE_FIREBASE_AUTH_DOMAIN}</span>
            </p>
          </div>
        </div>

        {/* Auth Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className={`h-5 w-5 ${user ? 'text-green-500' : 'text-yellow-500'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-300">Authentication</span>
          </div>
          <span className={`text-sm ${user ? 'text-green-500' : 'text-yellow-500'}`}>
            {user ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </div>

        {/* User Details */}
        {user && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                User ID: <span className="font-mono text-xs">{user.uid}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email: {user.email}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last Sign In: {new Date(user.metadata.lastSignInTime || '').toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 