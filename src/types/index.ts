export type PlanSlug = "fatigue" | "sleep" | "immune" | "stress";

export interface Plan {
  slug: PlanSlug;
  name: string;
  type: string;
  description: string;
  ingredients: string[];
  price: number;
}

export type ExperimentalStatus = "beta" | "alpha" | "preview";

export interface ExperimentalFeature {
  id: string;
  name: string;
  description: string;
  status: ExperimentalStatus;
}
