
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
  source?: string;
  location?: string;
  author?: string;
  highlights?: Highlight[];
}
