import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useStore } from '@/lib/store';
import type { LinkItem, LinkFormData } from '@/types/link';

export function useLinks() {
  const { user } = useStore();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (!user?.uid) {
      setLinks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'links'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const linksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LinkItem[];
      setLinks(linksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const addLink = async (data: LinkFormData) => {
    if (!user) return;

    const linkData: Omit<LinkItem, 'id'> = {
      ...data,
      createdAt: new Date().toISOString(),
      userId: user.uid,
      favicon: `https://www.google.com/s2/favicons?domain=${data.url}`
    };

    await addDoc(collection(db, 'links'), linkData);
  };

  const deleteLink = async (id: string) => {
    await deleteDoc(doc(db, 'links', id));
  };

  return { links, loading, addLink, deleteLink };
}