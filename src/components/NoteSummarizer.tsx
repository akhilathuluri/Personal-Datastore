import { useState } from 'react';
import { FileText, Loader } from 'lucide-react';
import { Button } from './ui/Button';
import { summarizeText } from '@/lib/gemini';
import { getUserSettings } from '@/lib/settings';

interface NoteSummarizerProps {
  content: string;
  userId: string;
}

export function NoteSummarizer({ content, userId }: NoteSummarizerProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = await getUserSettings(userId);
      if (!settings?.geminiApiKey) {
        throw new Error('Please configure your Gemini API key in settings');
      }

      const summarizedText = await summarizeText(content, settings.geminiApiKey);
      setSummary(summarizedText);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSummarize}
        disabled={loading}
        variant="outline"
        className="flex items-center space-x-2"
      >
        {loading ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <span>{loading ? 'Generating Summary...' : 'Summarize'}</span>
      </Button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {summary && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
          <h3 className="font-medium text-gray-900 dark:text-white">Summary</h3>
          <p className="text-gray-700 dark:text-gray-300">{summary}</p>
        </div>
      )}
    </div>
  );
} 