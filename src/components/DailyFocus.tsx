import { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useStore } from '@/lib/store';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FocusSession {
  taskId: string | null;
  timeRemaining: number;
  isActive: boolean;
  completedPomodoros: number;
}

const POMODORO_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

export function DailyFocus() {
  const { user } = useStore();
  const [session, setSession] = useState<FocusSession>({
    taskId: null,
    timeRemaining: POMODORO_TIME,
    isActive: false,
    completedPomodoros: 0
  });
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    // Load saved session
    const loadSession = async () => {
      const sessionDoc = await getDoc(doc(db, 'focusSessions', user.uid));
      if (sessionDoc.exists()) {
        setSession(sessionDoc.data() as FocusSession);
      }
    };

    loadSession();
  }, [user]);

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

  const handleSessionComplete = async () => {
    if (!user?.uid) return;

    const newSession = {
      ...session,
      isActive: false,
      completedPomodoros: isBreak ? session.completedPomodoros : session.completedPomodoros + 1,
      timeRemaining: isBreak ? POMODORO_TIME : BREAK_TIME
    };

    setSession(newSession);
    setIsBreak(!isBreak);

    // Play notification sound
    const audio = new Audio('/notification.mp3');
    audio.play();

    // Save to Firebase
    await setDoc(doc(db, 'focusSessions', user.uid), newSession);

    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification(isBreak ? 'Break Complete!' : 'Pomodoro Complete!', {
        body: isBreak ? 'Time to focus!' : 'Time for a break!',
        icon: '/favicon.ico'
      });
    }
  };

  const toggleTimer = async () => {
    if (!user?.uid) return;

    const newSession = {
      ...session,
      isActive: !session.isActive
    };

    setSession(newSession);
    await setDoc(doc(db, 'focusSessions', user.uid), newSession);
  };

  const resetTimer = async () => {
    if (!user?.uid) return;

    const newSession = {
      ...session,
      isActive: false,
      timeRemaining: POMODORO_TIME,
      completedPomodoros: 0
    };

    setSession(newSession);
    setIsBreak(false);
    await setDoc(doc(db, 'focusSessions', user.uid), newSession);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Daily Focus
        </h2>
        <div className="flex items-center space-x-2">
          <Timer className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {session.completedPomodoros} pomodoros completed
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <div className="text-5xl font-bold text-gray-900 dark:text-white">
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

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {isBreak ? 'Time for a break!' : 'Stay focused!'}
        </div>
      </div>
    </div>
  );
} 