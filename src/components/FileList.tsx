import { useState } from 'react';
import { FileItem } from '@/types/file';
import { formatFileSize } from '@/lib/utils';
import { File, Trash2, Download } from 'lucide-react';
import { Button } from './ui/Button';

interface FileListProps {
  files: FileItem[];
  onDelete?: (fileId: string, fileUrl: string) => Promise<void>;
}

export default function FileList({ files, onDelete }: FileListProps) {
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const handleDelete = async (fileId: string, fileUrl: string) => {
    if (!onDelete) return;
    
    try {
      setDeletingFiles(prev => new Set(prev).add(fileId));
      await onDelete(fileId, fileUrl);
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow group hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <File className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <Download className="h-4 w-4" />
            </a>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(file.id, file.url)}
                disabled={deletingFiles.has(file.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                {deletingFiles.has(file.id) ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}