export type PlanSlug = "fatigue" | "sleep" | "immune" | "stress" | "liver" | "beauty" | "cardio";

export interface Plan {
  slug: PlanSlug;
  name: string;
  type: string;
  description: string;
  ingredients: string[];
  price: number;
}

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface OrderForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customer: OrderForm;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
}

export interface QuizAnswer {
  questionId: number;
  answer: string;
}

export interface QuizResult {
  id: string;
  answers: QuizAnswer[];
  recommendations: PlanSlug[];
  createdAt: string;
}
