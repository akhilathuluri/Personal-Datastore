import { useState } from 'react';
import { useLinks } from '@/hooks/useLinks';
import { Button } from '@/components/ui/Button';
import { Link as LinkIcon, Plus, Trash2, ExternalLink } from 'lucide-react';
import type { LinkFormData } from '@/types/link';

export default function Links() {
  const { links, loading, addLink, deleteLink } = useLinks();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<LinkFormData>({
    url: '',
    title: '',
    description: '',
    tags: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addLink(formData);
    setFormData({ url: '', title: '', description: '', tags: [] });
    setShowForm(false);
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
          <LinkIcon className="h-6 w-6 text-purple-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Links</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
              <input
                type="url"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Link</Button>
            </div>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {links.map((link) => (
          <div key={link.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {link.favicon && (
                  <img src={link.favicon} alt="" className="w-4 h-4 mt-1" />
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {link.title}
                  </h3>
                  {link.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {link.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
                <button
                  onClick={() => deleteLink(link.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}