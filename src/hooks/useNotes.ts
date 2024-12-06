import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useStore } from '@/lib/store';
import type { NoteItem, NoteFormData } from '@/types/note';

export function useNotes() {
  const { user } = useStore();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (!user?.uid) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NoteItem[];
      setNotes(notesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const addNote = async (data: NoteFormData) => {
    if (!user) return;

    const now = new Date().toISOString();
    const noteData: Omit<NoteItem, 'id'> = {
      ...data,
      createdAt: now,
      updatedAt: now,
      userId: user.uid
    };

    await addDoc(collection(db, 'notes'), noteData);
  };

  const updateNote = async (id: string, data: Partial<NoteFormData>) => {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'notes', id), updateData);
  };

  const deleteNote = async (id: string) => {
    await deleteDoc(doc(db, 'notes', id));
  };

  return { notes, loading, addNote, updateNote, deleteNote };
}