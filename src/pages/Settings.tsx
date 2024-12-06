import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { saveUserSettings, getUserSettings } from '@/lib/settings';
import { Button } from '@/components/ui/Button';
import { Key, Save, LogOut, Moon, Sun } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, theme, setTheme } = useStore();
  const navigate = useNavigate();
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    try {
      const settings = await getUserSettings(user.uid);
      if (settings?.geminiApiKey) {
        setGeminiApiKey(settings.geminiApiKey);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await saveUserSettings(user.uid, {
        geminiApiKey: geminiApiKey.trim()
      });
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
        {/* API Configuration Section */}
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            API Configuration
          </h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Google Gemini API Key
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter your Gemini API key"
                />
                <Key className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </Button>
            </div>
            {message && (
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {message.text}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get your API key from the{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                Google AI Studio
              </a>
            </p>
          </div>
        </div>

        {/* Theme Section */}
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Appearance
          </h2>
          <Button
            variant="outline"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="flex items-center space-x-2"
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-4 w-4" />
                <span>Switch to Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                <span>Switch to Light Mode</span>
              </>
            )}
          </Button>
        </div>

        {/* Sign Out Section */}
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Account
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Signed in as: {user?.email}
            </p>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}