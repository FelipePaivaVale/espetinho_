export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  table_number: number;
  items: OrderItem[];
  status: 'pending' | 'completed';
  created_at: string;
  total: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  active: boolean;
  created_at: string;
}