export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  amazon_url: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}