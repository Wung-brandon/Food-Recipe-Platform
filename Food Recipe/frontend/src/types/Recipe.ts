/* eslint-disable @typescript-eslint/no-explicit-any */
export interface RecipeData {
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
  
  interface Author {
    id: string;
    name: string;
    avatar: string;
  }
  
  interface Ingredient {
    id: string;
    name: string;
    amount: string;
    checked: boolean;
  }
  
  interface Step {
    id: string;
    description: string;
  }
export interface Recipe {
    id: string;
    title: string;
    imageFile?: File | null; // Added imageFile property
    description: string;
    image: string;
    preparationTime: number;
    cookingTime: number;
    servings: number;
    difficulty: string;
    calories: number;
    rating: number;
    ratingCount: number;
    author: Author;
    ingredients: Ingredient[];
    steps: Step[];
    tips: string[];
    isFavorite: boolean;
    category: string;
    tags: string[];
  }