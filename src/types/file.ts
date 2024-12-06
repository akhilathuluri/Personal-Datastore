export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  createdAt: string;
  userId: string;
  path: string;
  tags: string[];
}

export type FileUploadStatus = {
  fileName: string;
  progress: number;
  error?: string;
  completed: boolean;
};