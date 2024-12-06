export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface NoteFormData {
  title: string;
  content: string;
  tags: string[];
}