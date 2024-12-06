import { useState, useEffect } from 'react';
import { useFiles } from '@/hooks/useFiles';
import FileUploader from '@/components/FileUploader';
import FileList from '@/components/FileList';
import { FileUploadProgress } from '@/components/FileUploadProgress';
import { Button } from '@/components/ui/Button';
import { Folder, Plus } from 'lucide-react';
import { FileFilters } from '@/components/FileFilters';
import { FileTagInput } from '@/components/FileTagInput';

export default function Files() {
  const { files, loading, uploadFile, uploadStatus, deleteFile } = useFiles();
  const [showUploader, setShowUploader] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [filteredFiles, setFilteredFiles] = useState(files);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);

  useEffect(() => {
    setFilteredFiles(files);
  }, [files]);

  const handleUpload = async (uploadedFiles: File[]) => {
    for (const file of uploadedFiles) {
      await uploadFile(file);
    }
    setShowUploader(false);
  };

  const handleDelete = async (fileId: string, fileUrl: string) => {
    try {
      setDeleteError(null);
      await deleteFile(fileId, fileUrl);
    } catch (error) {
      setDeleteError('Failed to delete file. Please try again.');
      console.error('Error deleting file:', error);
    }
  };

  const handleSort = (field: 'name' | 'size' | 'createdAt', direction: 'asc' | 'desc') => {
    const sorted = [...filteredFiles].sort((a, b) => {
      if (field === 'name') {
        return direction === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (field === 'size') {
        return direction === 'asc' 
          ? a.size - b.size
          : b.size - a.size;
      }
      return direction === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setFilteredFiles(sorted);
  };

  const handleFilter = (type: string | null) => {
    setCurrentFilter(type);
    const filtered = files.filter(file => {
      if (!type) return true;
      
      const fileTypes = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        video: ['video/mp4', 'video/webm', 'video/quicktime'],
        audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
      };

      if (type === 'other') {
        return !Object.values(fileTypes).flat().includes(file.type);
      }

      return fileTypes[type as keyof typeof fileTypes]?.includes(file.type) || false;
    });
    setFilteredFiles(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Folder className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Files</h1>
        </div>
        <Button onClick={() => setShowUploader(!showUploader)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {deleteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{deleteError}</span>
        </div>
      )}

      {showUploader && (
        <div className="mb-6">
          <FileUploader onUpload={handleUpload} />
        </div>
      )}

      {/* Upload Progress */}
      {Object.entries(uploadStatus).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upload Progress
          </h2>
          {Object.entries(uploadStatus).map(([fileId, status]) => (
            <FileUploadProgress
              key={fileId}
              fileName={status.fileName || 'Unknown file'}
              status={status}
            />
          ))}
        </div>
      )}

      <FileFilters
        onSortChange={handleSort}
        onFilterByType={handleFilter}
        currentFilter={currentFilter}
      />

      {files.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No files uploaded yet</p>
        </div>
      ) : (
        <FileList files={filteredFiles} onDelete={handleDelete} />
      )}
    </div>
  );
}