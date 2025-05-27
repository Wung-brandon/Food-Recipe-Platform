interface CategoryData {
    id: string;
    slug?: string; // Optional slug for routing
    name: string;
    recipeCount: number;
    imageUrl?: string;
    colorStart?: string;
    colorEnd?: string;
  }


export default CategoryData