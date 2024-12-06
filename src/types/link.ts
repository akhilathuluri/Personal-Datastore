export interface LinkItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  favicon?: string;
  createdAt: string;
  userId: string;
}

export interface LinkFormData {
  url: string;
  title: string;
  description?: string;
  tags: string[];
}