interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple';
}

export function ProgressBar({ 
  progress, 
  className = '', 
  showPercentage = true,
  size = 'md',
  color = 'blue'
}: ProgressBarProps) {
  const height = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }[size];

  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  }[color];

  return (
    <div className="space-y-1">
      {showPercentage && (
        <div className="flex justify-end">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${height} ${className}`}>
        <div
          className={`${colors} ${height} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </div>
  );
} 