export interface CartItem {
  id: number;
  ingredient: {
    id: number;
    name: string;
    price: string;
    image?: string;
    unit: string;
  };
  quantity: number;
  total_price: string;
}

export interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  loading: boolean;
  error: string | null;
}