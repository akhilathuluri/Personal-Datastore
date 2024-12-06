import { useState, useEffect } from 'react';
import { 
  Upload, 
  PlusCircle, 
  Link as LinkIcon, 
  Search,
  CheckCircle,
  Clock,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useStore } from '@/lib/store';
import { Weather } from './Weather';
import { QuickSearch } from './QuickSearch';
import { formatDistanceToNow } from 'date-fns';

interface Task {
  id: string;
  text: string;
  status: 'pending' | 'completed';
  createdAt: string;
  userId: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

export function QuickActions() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);

  // Fetch tasks
  useEffect(() => {
    if (!user) return;

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const taskData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(taskData);
    });

    return () => unsubscribe();
  }, [user]);

  const addTask = async () => {
    if (!user || !newTaskText.trim()) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        text: newTaskText,
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: user.uid
      });
      setNewTaskText('');
      setShowTaskInput(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: currentStatus === 'completed' ? 'pending' : 'completed'
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'upload',
      title: 'Upload File',
      description: 'Upload a new file to your storage',
      icon: <Upload className="h-5 w-5" />,
      action: () => navigate('/files?upload=true'),
      color: 'text-blue-500'
    },
    {
      id: 'note',
      title: 'New Note',
      description: 'Create a new note',
      icon: <PlusCircle className="h-5 w-5" />,
      action: () => navigate('/notes?new=true'),
      color: 'text-green-500'
    },
    {
      id: 'link',
      title: 'Save Link',
      description: 'Save a new bookmark',
      icon: <LinkIcon className="h-5 w-5" />,
      action: () => navigate('/links?new=true'),
      color: 'text-purple-500'
    },
    {
      id: 'search',
      title: 'Quick Search',
      description: 'Search across all content',
      icon: <Search className="h-5 w-5" />,
      action: () => navigate('/search'),
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Section: Weather and Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather Widget */}
        <Weather />
        
        {/* Quick Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Search
          </h2>
          <QuickSearch />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md"
              >
                <div className={`mb-2 ${action.color}`}>{action.icon}</div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  {action.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tasks
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTaskInput(true)}
              className="hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>

          {showTaskInput && (
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="What needs to be done?"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addTask();
                    } else if (e.key === 'Escape') {
                      setShowTaskInput(false);
                      setNewTaskText('');
                    }
                  }}
                  autoFocus
                />
                <Button onClick={addTask} className="bg-blue-500 hover:bg-blue-600">
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Press Enter to add or Escape to cancel
              </p>
            </div>
          )}

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No tasks yet. Add one to get started!
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => toggleTaskStatus(task.id, task.status)}
                >
                  <button className="mt-0.5 focus:outline-none">
                    {task.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-gray-900 dark:text-white truncate ${
                      task.status === 'completed' ? 'line-through text-gray-500' : ''
                    }`}>
                      {task.text}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 