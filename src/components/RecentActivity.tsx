import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FileText, Link as LinkIcon, File, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '@/lib/store';

interface ActivityItem {
  id: string;
  type: 'file' | 'note' | 'link';
  name: string;
  createdAt: string;
}

export function RecentActivity() {
  const { user } = useStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Create queries for each collection
    const filesQuery = query(
      collection(db, 'files'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const linksQuery = query(
      collection(db, 'links'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    // Subscribe to real-time updates
    const unsubscribeFiles = onSnapshot(filesQuery, (snapshot) => {
      const fileActivities = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'file' as const,
        name: doc.data().name,
        createdAt: doc.data().createdAt
      }));
      updateActivities(fileActivities);
    });

    const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
      const noteActivities = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'note' as const,
        name: doc.data().title,
        createdAt: doc.data().createdAt
      }));
      updateActivities(noteActivities);
    });

    const unsubscribLinks = onSnapshot(linksQuery, (snapshot) => {
      const linkActivities = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'link' as const,
        name: doc.data().title,
        createdAt: doc.data().createdAt
      }));
      updateActivities(linkActivities);
    });

    setLoading(false);

    // Cleanup subscriptions
    return () => {
      unsubscribeFiles();
      unsubscribeNotes();
      unsubscribLinks();
    };
  }, [user?.uid]);

  const updateActivities = (newActivities: ActivityItem[]) => {
    setActivities(current => {
      const combined = [...current, ...newActivities];
      // Remove duplicates and sort by date
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      return unique
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'file': return <File className="h-4 w-4 text-blue-500" />;
      case 'note': return <FileText className="h-4 w-4 text-green-500" />;
      case 'link': return <LinkIcon className="h-4 w-4 text-purple-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activity
      </h2>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-3 text-sm"
            >
              {getIcon(activity.type)}
              <span className="flex-1 text-gray-900 dark:text-white truncate">
                {activity.name}
              </span>
              <span className="text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 