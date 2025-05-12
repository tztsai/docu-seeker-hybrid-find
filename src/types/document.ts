
export interface Highlight {
  score: number;
  content: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  tags: string[];
  author?: string;
  highlights?: Highlight[];
}
