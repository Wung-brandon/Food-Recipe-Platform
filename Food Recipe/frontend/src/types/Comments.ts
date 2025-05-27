export interface Comment {
  id: string;
  user?: {
    name: string;
    avatar: string;
  };
  date?: string;
  rating: number;
  content: string;
  likes?: number;
  isLiked?: boolean;
}