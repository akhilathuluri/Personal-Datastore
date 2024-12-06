import { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/Button';
import { FileText, Plus, Save, Trash2 } from 'lucide-react';
import type { NoteFormData } from '@/types/note';
import { NoteSummarizer } from '@/components/NoteSummarizer';
import { useStore } from '@/lib/store';

export default function Notes() {
  const { user } = useStore();
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes();
  const [showEditor, setShowEditor] = useState(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      if (activeNote) {
        updateNote(activeNote, {
          content: editor.getHTML(),
          title
        });
      }
    }
  });

  const handleNewNote = () => {
    setShowEditor(true);
    setActiveNote(null);
    setTitle('');
    editor?.commands.setContent('');
  };

  const handleSave = async () => {
    if (!editor) return;

    const noteData: NoteFormData = {
      title,
      content: editor.getHTML(),
      tags: []
    };

    if (activeNote) {
      await updateNote(activeNote, noteData);
    } else {
      await addNote(noteData);
    }

    setShowEditor(false);
    setActiveNote(null);
    setTitle('');
    editor.commands.setContent('');
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
          <FileText className="h-6 w-6 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes</h1>
        </div>
        <Button onClick={handleNewNote}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {showEditor && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <input
            type="text"
            placeholder="Note title"
            className="w-full text-xl font-bold mb-4 bg-transparent border-none focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <EditorContent editor={editor} className="prose dark:prose-invert max-w-none" />
          <div className="flex justify-end mt-4">
            <Button onClick={handleSave} className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {note.title}
                </h3>
                <div
                  className="mt-2 prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
                {user && (
                  <div className="mt-4">
                    <NoteSummarizer 
                      content={note.content} 
                      userId={user.uid} 
                    />
                  </div>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => {
                    setShowEditor(true);
                    setActiveNote(note.id);
                    setTitle(note.title);
                    editor?.commands.setContent(note.content);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
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