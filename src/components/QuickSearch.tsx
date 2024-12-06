import { useState, useEffect } from 'react';
import { Search, File, FileText, Link as LinkIcon, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFiles } from '@/hooks/useFiles';
import { useNotes } from '@/hooks/useNotes';
import { useLinks } from '@/hooks/useLinks';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  type: 'file' | 'note' | 'link';
  url?: string;
  path?: string;
}

export function QuickSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const navigate = useNavigate();
  const { files, loading: filesLoading } = useFiles();
  const { notes, loading: notesLoading } = useNotes();
  const { links, loading: linksLoading } = useLinks();

  const isLoading = filesLoading || notesLoading || linksLoading;

  useEffect(() => {
    const searchItems = () => {
      if (!query.trim() || isLoading) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      const searchTerm = query.toLowerCase();

      const fileResults: SearchResult[] = (files || [])
        .filter(file => file.name.toLowerCase().includes(searchTerm))
        .map(file => ({
          id: file.id,
          title: file.name,
          type: 'file',
          path: file.path
        }));

      const noteResults: SearchResult[] = (notes || [])
        .filter(note => 
          note.title.toLowerCase().includes(searchTerm) || 
          note.content.toLowerCase().includes(searchTerm)
        )
        .map(note => ({
          id: note.id,
          title: note.title,
          type: 'note'
        }));

      const linkResults: SearchResult[] = (links || [])
        .filter(link => 
          link.title.toLowerCase().includes(searchTerm) || 
          link.url.toLowerCase().includes(searchTerm)
        )
        .map(link => ({
          id: link.id,
          title: link.title,
          type: 'link',
          url: link.url
        }));

      setResults([...fileResults, ...noteResults, ...linkResults]);
      setIsSearching(false);
    };

    const debounceTimeout = setTimeout(searchItems, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query, files, notes, links, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setQuery('');
        setResults([]);
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'file':
        navigate('/files');
        break;
      case 'note':
        navigate('/notes');
        break;
      case 'link':
        navigate('/links');
        break;
    }
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search files, notes, and links..."
          className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        {isSearching && (
          <Loader className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-500" />
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute mt-2 w-full rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => handleResultClick(result)}
              className={cn(
                "flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700",
                selectedIndex === index && "bg-gray-100 dark:bg-gray-700"
              )}
            >
              {result.type === 'file' && <File className="mr-2 h-4 w-4 text-blue-500" />}
              {result.type === 'note' && <FileText className="mr-2 h-4 w-4 text-green-500" />}
              {result.type === 'link' && <LinkIcon className="mr-2 h-4 w-4 text-purple-500" />}
              <span>{result.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 