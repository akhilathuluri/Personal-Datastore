import { useState, useEffect } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  Plus, 
  Trash2,
  BarChart,
  Calendar,
  Settings as SettingsIcon,
  Target, 
  TrendingUp, 
  Quote,
  Award,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import { doc, collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';

interface FocusSession {
  taskId: string | null;
  timeRemaining: number;
  isActive: boolean;
  completedPomodoros: number;
}

interface Task {
  id: string;
  text: string;
  status: 'pending' | 'completed';
  createdAt: string;
  userId: string;
  pomodorosCompleted?: number;
}

interface TimerSettings {
  focusDuration: number;
  breakDuration: number;
}

interface DailyGoal {
  target: number;
  achieved: number;
  date: string;
}

interface ProductivityStats {
  totalPomodoros: number;
  totalFocusTime: number;
  longestStreak: number;
  dailyAverage: number;
}

const POMODORO_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

export default function Focus() {
  const { user } = useStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [session, setSession] = useState<FocusSession>({
    taskId: null,
    timeRemaining: POMODORO_TIME,
    isActive: false,
    completedPomodoros: 0
  });
  const [isBreak, setIsBreak] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    focusDuration: 25,
    breakDuration: 5
  });
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>({
    target: 8,
    achieved: 0,
    date: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = useState<ProductivityStats>({
    totalPomodoros: 0,
    totalFocusTime: 0,
    longestStreak: 0,
    dailyAverage: 0
  });
  const [quote, setQuote] = useState({ text: '', author: '' });

  // Load tasks
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

  // Load saved session
  useEffect(() => {
    if (!user?.uid) return;

    const loadSession = async () => {
      const sessionDoc = await getDoc(doc(db, 'focusSessions', user.uid));
      if (sessionDoc.exists()) {
        const data = sessionDoc.data() as FocusSession;
        setSession(data);
        setSelectedTaskId(data.taskId);
      }
    };

    loadSession();
  }, [user]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (session.isActive && session.timeRemaining > 0) {
      interval = setInterval(() => {
        setSession(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (session.timeRemaining === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [session.isActive, session.timeRemaining]);

  useEffect(() => {
    if (!user?.uid) return;

    // Load user timer settings
    const loadSettings = async () => {
      const settingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
      if (settingsDoc.exists() && settingsDoc.data().timerSettings) {
        setSettings(settingsDoc.data().timerSettings);
      }
    };

    loadSettings();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;

    const loadDailyGoal = async () => {
      const goalDoc = await getDoc(doc(db, 'dailyGoals', `${user.uid}_${new Date().toISOString().split('T')[0]}`));
      if (goalDoc.exists()) {
        setDailyGoal(goalDoc.data() as DailyGoal);
      } else {
        // Create new daily goal
        const newGoal = {
          target: 8,
          achieved: 0,
          date: new Date().toISOString().split('T')[0]
        };
        await setDoc(doc(db, 'dailyGoals', `${user.uid}_${newGoal.date}`), newGoal);
        setDailyGoal(newGoal);
      }
    };

    loadDailyGoal();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;

    const loadStats = async () => {
      const statsDoc = await getDoc(doc(db, 'productivityStats', user.uid));
      if (statsDoc.exists()) {
        setStats(statsDoc.data() as ProductivityStats);
      }
    };

    loadStats();
  }, [user]);

  useEffect(() => {
    const quotes = [
      {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney"
      },
      {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson"
      },
      {
        text: "The future depends on what you do today.",
        author: "Mahatma Gandhi"
      },
      {
        text: "Focus on being productive instead of busy.",
        author: "Tim Ferriss"
      },
      {
        text: "It's not about time, it's about choices. How are you spending your choices?",
        author: "Beverly Adamo"
      },
      {
        text: "Until we can manage time, we can manage nothing else.",
        author: "Peter Drucker"
      },
      {
        text: "Time is the most valuable thing a man can spend.",
        author: "Theophrastus"
      },
      {
        text: "Lost time is never found again.",
        author: "Benjamin Franklin"
      },
      {
        text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
        author: "Stephen Covey"
      },
      {
        text: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.",
        author: "Paul J. Meyer"
      },
      {
        text: "The only way around is through.",
        author: "Robert Frost"
      },
      {
        text: "You miss 100% of the shots you don't take.",
        author: "Wayne Gretzky"
      },
      {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill"
      },
      {
        text: "The most difficult thing is the decision to act, the rest is merely tenacity.",
        author: "Amelia Earhart"
      },
      {
        text: "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did do.",
        author: "Mark Twain"
      }
    ];

    // Get a random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []); // Empty dependency array means this runs once when component mounts

  const handleSessionComplete = async () => {
    if (!user?.uid) return;

    const newSession = {
      ...session,
      isActive: false,
      completedPomodoros: isBreak ? session.completedPomodoros : session.completedPomodoros + 1,
      timeRemaining: isBreak ? settings.focusDuration * 60 : settings.breakDuration * 60
    };

    setSession(newSession);
    setIsBreak(!isBreak);

    // Update task pomodoro count
    if (selectedTaskId && !isBreak) {
      const taskRef = doc(db, 'tasks', selectedTaskId);
      const taskDoc = await getDoc(taskRef);
      if (taskDoc.exists()) {
        const currentCount = taskDoc.data().pomodorosCompleted || 0;
        await updateDoc(taskRef, {
          pomodorosCompleted: currentCount + 1
        });
      }
    }

    // Save session to Firebase - ensure we're only saving serializable data
    await setDoc(doc(db, 'focusSessions', user.uid), {
      taskId: newSession.taskId,
      timeRemaining: Number(newSession.timeRemaining),
      isActive: newSession.isActive,
      completedPomodoros: Number(newSession.completedPomodoros)
    });

    // Show notification
    if (Notification.permission === 'granted') {
      new Notification(isBreak ? 'Break Complete!' : 'Pomodoro Complete!', {
        body: isBreak ? 'Time to focus!' : 'Time for a break!',
      });
    }

    if (!isBreak) {
      // Update daily goal
      const newGoal = {
        ...dailyGoal,
        achieved: dailyGoal.achieved + 1
      };
      setDailyGoal(newGoal);
      await setDoc(doc(db, 'dailyGoals', `${user.uid}_${newGoal.date}`), newGoal);

      // Update stats
      const newStats = {
        ...stats,
        totalPomodoros: stats.totalPomodoros + 1,
        totalFocusTime: stats.totalFocusTime + settings.focusDuration,
        dailyAverage: Math.round((stats.totalPomodoros + 1) * settings.focusDuration / 30) // Simple 30-day average
      };
      setStats(newStats);
      await setDoc(doc(db, 'productivityStats', user.uid), newStats);
    }
  };

  const addTask = async () => {
    if (!user || !newTaskText.trim()) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        text: newTaskText,
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: user.uid,
        pomodorosCompleted: 0
      });
      setNewTaskText('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTimer = async () => {
    if (!user?.uid) return;

    const newSession = {
      ...session,
      isActive: !session.isActive,
      taskId: selectedTaskId
    };

    setSession(newSession);
    
    // Save session to Firebase - ensure we're only saving serializable data
    await setDoc(doc(db, 'focusSessions', user.uid), {
      taskId: newSession.taskId,
      timeRemaining: Number(newSession.timeRemaining),
      isActive: newSession.isActive,
      completedPomodoros: Number(newSession.completedPomodoros)
    });
  };

  const resetTimer = async (duration?: number) => {
    if (!user?.uid) return;

    const newSession = {
      ...session,
      isActive: false,
      timeRemaining: duration || settings.focusDuration * 60,
      completedPomodoros: 0,
      taskId: null
    };

    setSession(newSession);
    setIsBreak(false);
    setSelectedTaskId(null);

    // Save session to Firebase - ensure we're only saving serializable data
    await setDoc(doc(db, 'focusSessions', user.uid), {
      taskId: newSession.taskId,
      timeRemaining: Number(newSession.timeRemaining),
      isActive: newSession.isActive,
      completedPomodoros: Number(newSession.completedPomodoros)
    });
  };

  const saveSettings = async (newSettings: TimerSettings) => {
    if (!user?.uid) return;

    try {
      await setDoc(doc(db, 'userSettings', user.uid), 
        { timerSettings: newSettings }, 
        { merge: true }
      );
      setSettings(newSettings);
      setShowSettings(false);
      
      // Reset timer with new duration
      resetTimer(newSettings.focusDuration * 60);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Focus Mode
        </h1>
        <Button
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-2"
        >
          <SettingsIcon className="h-4 w-4" />
          <span>Timer Settings</span>
        </Button>
      </div>

      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Timer Settings
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Focus Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.focusDuration}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  focusDuration: Math.max(1, Math.min(60, parseInt(e.target.value) || 1))
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.breakDuration}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  breakDuration: Math.max(1, Math.min(30, parseInt(e.target.value) || 1))
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveSettings(settings)}
            >
              Save Settings
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="text-6xl font-bold text-gray-900 dark:text-white">
              {formatTime(session.timeRemaining)}
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={toggleTimer}
                className={session.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
              >
                {session.isActive ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start {isBreak ? 'Break' : 'Focus'}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetTimer}>
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isBreak ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{
                  width: `${(session.timeRemaining / (isBreak ? BREAK_TIME : POMODORO_TIME)) * 100}%`
                }}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {session.completedPomodoros} pomodoros completed today
              </span>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Focus Tasks
            </h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a new task"
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <Button onClick={addTask}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                  selectedTaskId === task.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {task.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className={`text-sm ${
                      task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.text}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Timer className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {task.pomodorosCompleted || 0} pomodoros
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDoc(doc(db, 'tasks', task.id));
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Productivity Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Daily Goal</h3>
            <Target className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dailyGoal.achieved} / {dailyGoal.target}
            </div>
            <div className="text-sm text-gray-500">
              Pomodoros
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${Math.min(100, (dailyGoal.achieved / dailyGoal.target) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Total Focus Time</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(stats.totalFocusTime / 60)} hrs
          </div>
          <div className="text-sm text-gray-500">
            Across {stats.totalPomodoros} sessions
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Daily Average</h3>
            <Award className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.dailyAverage} min
          </div>
          <div className="text-sm text-gray-500">
            Per day (30-day average)
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Longest Streak</h3>
            <Zap className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.longestStreak} days
          </div>
          <div className="text-sm text-gray-500">
            Consecutive focus days
          </div>
        </div>
      </div>

      {/* Motivation Quote */}
      {quote.text && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-start space-x-4">
            <Quote className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-lg text-gray-900 dark:text-white italic">
                "{quote.text}"
              </p>
              <p className="text-sm text-gray-500 mt-2">
                — {quote.author}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 