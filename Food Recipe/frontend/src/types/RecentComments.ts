export interface RecentComment {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    profile_picture?: string;
  } | null;
  username: string;
  text: string;
  created_at: string;
  rating: number;
  recipe_title: string;
}
