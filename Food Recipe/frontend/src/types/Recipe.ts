/* eslint-disable @typescript-eslint/no-explicit-any */
interface RecipeData {
    id?: number;
    title: string;
    category: string;
    imageUrl: string | any; // Accepts a URL string or an imported image
    cookTime: number;
    difficulty: string;
    rating: number | string;
    reviewCount: number;
    author: {
      name: string;
      avatarUrl: string | any;
    };
    isSaved: boolean;
    isLiked: boolean;
    likeCount: number;
    commentCount?: number; // Optional if some recipes don't have comments
    createdAt?: string; // Optional if it's not always present
  }
  
  export default RecipeData;
  