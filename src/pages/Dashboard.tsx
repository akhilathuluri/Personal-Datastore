import { useStore } from '@/lib/store';
import { Files, Link as LinkIcon, FileText } from 'lucide-react';
import ConnectionStatus from '@/components/ConnectionStatus';
import { RecentActivity } from '@/components/RecentActivity';
import { StorageStats } from '@/components/StorageStats';
import { QuickActions } from '@/components/QuickActions';
import { QuickSearch } from '@/components/QuickSearch';

export default function Dashboard() {
  const { user } = useStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome, {user?.email}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Actions and Task Completion */}
          <QuickActions />

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <Files className="h-8 w-8 text-blue-500 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Files</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Manage and organize your files securely
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <FileText className="h-8 w-8 text-green-500 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Create and edit your personal notes
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <LinkIcon className="h-8 w-8 text-purple-500 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Links</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Save and organize your important links
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity />
        </div>

        {/* Status Panels - 1 column */}
        <div className="lg:col-span-1 space-y-6">
          <ConnectionStatus />
          <StorageStats />
        </div>
      </div>
    </div>
  );
}