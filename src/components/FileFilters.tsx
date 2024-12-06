import { useState } from 'react';
import { Filter, SortAsc, SortDesc, FileIcon, Image, FileText, Video, Music, Files } from 'lucide-react';
import { Button } from './ui/Button';

interface FileFiltersProps {
  onSortChange: (field: 'name' | 'size' | 'createdAt', direction: 'asc' | 'desc') => void;
  onFilterByType: (type: string | null) => void;
  currentFilter: string | null;
}

interface FileTypeOption {
  id: string;
  label: string;
  icon: typeof FileIcon;
  mimeTypes?: string[];
}

export function FileFilters({ onSortChange, onFilterByType, currentFilter }: FileFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'size' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fileTypes: FileTypeOption[] = [
    { id: 'all', label: 'All Files', icon: Files },
    { 
      id: 'image', 
      label: 'Images', 
      icon: Image,
      mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    },
    { 
      id: 'document', 
      label: 'Documents', 
      icon: FileText,
      mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },
    { 
      id: 'video', 
      label: 'Videos', 
      icon: Video,
      mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime']
    },
    { 
      id: 'audio', 
      label: 'Audio', 
      icon: Music,
      mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg']
    },
    { 
      id: 'other', 
      label: 'Other', 
      icon: FileIcon
    }
  ];

  const handleSort = (field: 'name' | 'size' | 'createdAt') => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    onSortChange(field, newDirection);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleSort('name')}
            className={sortField === 'name' ? 'text-blue-600' : ''}
          >
            Name {sortField === 'name' && (
              sortDirection === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSort('size')}
            className={sortField === 'size' ? 'text-blue-600' : ''}
          >
            Size {sortField === 'size' && (
              sortDirection === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSort('createdAt')}
            className={sortField === 'createdAt' ? 'text-blue-600' : ''}
          >
            Date {sortField === 'createdAt' && (
              sortDirection === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
            )}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">File Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {fileTypes.map(type => {
              const Icon = type.icon;
              const isActive = (type.id === 'all' && currentFilter === null) || currentFilter === type.id;
              
              return (
                <Button
                  key={type.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterByType(type.id === 'all' ? null : type.id)}
                  className={`flex items-center justify-center space-x-2 ${
                    isActive ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{type.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 