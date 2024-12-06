import { Navigate } from 'react-router-dom';
import { useStore } from '@/lib/store';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}