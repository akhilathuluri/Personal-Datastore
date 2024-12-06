import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Files, FileText, Link as LinkIcon, HardDrive } from 'lucide-react';
import { useStore } from '@/lib/store';

interface StorageStats {
  filesCount: number;
  notesCount: number;
  linksCount: number;
  totalStorage: number;
  storageLimit: number;
}

export function StorageStats() {
  const { user } = useStore();
  const [stats, setStats] = useState<StorageStats>({
    filesCount: 0,
    notesCount: 0,
    linksCount: 0,
    totalStorage: 0,
    storageLimit: 1024 * 1024 * 1024 // 1GB limit
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Fetch files stats
        const filesQuery = query(
          collection(db, 'files'),
          where('userId', '==', user.uid)
        );
        const filesSnapshot = await getDocs(filesQuery);
        const filesCount = filesSnapshot.size;
        const totalStorage = filesSnapshot.docs.reduce(
          (acc, doc) => acc + (doc.data().size || 0),
          0
        );

        // Fetch notes count
        const notesQuery = query(
          collection(db, 'notes'),
          where('userId', '==', user.uid)
        );
        const notesSnapshot = await getDocs(notesQuery);
        const notesCount = notesSnapshot.size;

        // Fetch links count
        const linksQuery = query(
          collection(db, 'links'),
          where('userId', '==', user.uid)
        );
        const linksSnapshot = await getDocs(linksQuery);
        const linksCount = linksSnapshot.size;

        setStats({
          filesCount,
          notesCount,
          linksCount,
          totalStorage,
          storageLimit: 1024 * 1024 * 1024
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching storage stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.uid]);

  const formatSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const usagePercentage = (stats.totalStorage / stats.storageLimit) * 100;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Storage Overview
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Files className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.filesCount}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Files</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.notesCount}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Notes</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <LinkIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.linksCount}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Links</div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Storage Used</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatSize(stats.totalStorage)} / {formatSize(stats.storageLimit)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                usagePercentage > 90 ? 'bg-red-500' : 
                usagePercentage > 70 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 