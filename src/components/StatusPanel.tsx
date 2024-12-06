import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useStore } from '@/lib/store';
import { Files, FileText, Link as LinkIcon } from 'lucide-react';

export default function StatusPanel() {
  const { user } = useStore();
  const [stats, setStats] = useState({
    files: 0,
    notes: 0,
    links: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Get files count
        const filesQuery = query(collection(db, 'files'), where('userId', '==', user.uid));
        const filesSnapshot = await getDocs(filesQuery);
        
        // Get notes count
        const notesQuery = query(collection(db, 'notes'), where('userId', '==', user.uid));
        const notesSnapshot = await getDocs(notesQuery);
        
        // Get links count
        const linksQuery = query(collection(db, 'links'), where('userId', '==', user.uid));
        const linksSnapshot = await getDocs(linksQuery);

        setStats({
          files: filesSnapshot.size,
          notes: notesSnapshot.size,
          links: linksSnapshot.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Storage Status
      </h3>
      
      <div className="space-y-3">
        {/* Files Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Files className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Files</span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {stats.files} items
          </span>
        </div>

        {/* Notes Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Notes</span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {stats.notes} items
          </span>
        </div>

        {/* Links Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Links</span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {stats.links} items
          </span>
        </div>

        {/* Storage Usage */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Storage Used</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {((stats.files + stats.notes + stats.links) / 1000).toFixed(2)} GB
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ 
                  width: `${Math.min(((stats.files + stats.notes + stats.links) / 100) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 