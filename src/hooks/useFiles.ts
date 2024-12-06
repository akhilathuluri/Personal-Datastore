import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, ref as storageRef } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useStore } from '@/lib/store';
import type { FileItem, FileUploadStatus } from '@/types/file';

export function useFiles() {
  const { user } = useStore();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, FileUploadStatus>>({});

  useEffect(() => {
    setLoading(true);
    
    if (!user?.uid) {
      setFiles([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'files'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const filesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as FileItem[];
          setFiles(filesData);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Files query error:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Files setup error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }, [user?.uid]);

  const uploadFile = async (file: File, path: string = '') => {
    if (!user) return;

    const fileId = Math.random().toString(36).substring(7);
    setUploadStatus(prev => ({
      ...prev,
      [fileId]: { 
        fileName: file.name,
        progress: 0, 
        completed: false 
      }
    }));

    try {
      const storageRef = ref(storage, `files/${user.uid}/${path}${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadStatus(prev => ({
              ...prev,
              [fileId]: { 
                fileName: file.name,
                progress, 
                completed: false 
              }
            }));
          },
          (error) => {
            setUploadStatus(prev => ({
              ...prev,
              [fileId]: { 
                fileName: file.name,
                progress: 0, 
                error: error.message, 
                completed: true 
              }
            }));
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const fileData: Omit<FileItem, 'id'> = {
                name: file.name,
                type: file.type,
                size: file.size,
                url: downloadURL,
                createdAt: new Date().toISOString(),
                userId: user.uid,
                path,
                tags: []
              };

              await addDoc(collection(db, 'files'), fileData);
              setUploadStatus(prev => ({
                ...prev,
                [fileId]: { 
                  fileName: file.name,
                  progress: 100, 
                  completed: true 
                }
              }));
              resolve(fileData);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      setUploadStatus(prev => ({
        ...prev,
        [fileId]: { 
          fileName: file.name,
          progress: 0, 
          error: error instanceof Error ? error.message : 'Upload failed', 
          completed: true 
        }
      }));
      throw error;
    }
  };

  const deleteFile = async (fileId: string, fileUrl: string) => {
    if (!user) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'files', fileId));

      // Delete from Storage
      const fileRef = storageRef(storage, fileUrl);
      await deleteObject(fileRef);

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  return { files, loading, error, uploadStatus, uploadFile, deleteFile };
}