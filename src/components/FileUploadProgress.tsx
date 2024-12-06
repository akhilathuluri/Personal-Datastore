import { FileUploadStatus } from '@/types/file';
import { ProgressBar } from './ui/ProgressBar';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface FileUploadProgressProps {
  fileName: string;
  status: FileUploadStatus;
  onCancel?: () => void;
}

export function FileUploadProgress({ fileName, status, onCancel }: FileUploadProgressProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {status.completed ? (
              status.error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {fileName}
            </span>
          </div>
          {!status.completed && onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {status.error ? (
          <p className="text-sm text-red-500">{status.error}</p>
        ) : (
          <ProgressBar
            progress={status.progress}
            size="sm"
            color={status.completed ? 'green' : 'blue'}
          />
        )}
      </div>
    </div>
  );
} 