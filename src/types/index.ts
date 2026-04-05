export type PlanSlug = "fatigue" | "sleep" | "immune" | "stress";

export interface Plan {
  slug: PlanSlug;
  name: string;
  type: string;
  description: string;
  ingredients: string[];
  price: number;
}
