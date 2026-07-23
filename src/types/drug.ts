export type DrugCategory =
  | "Cardiovascular"
  | "Diabetes"
  | "Pain & Inflammation"
  | "Mental Health"
  | "Respiratory"
  | "Antibiotic"
  | "GI"
  | "Thyroid & Hormone"
  | "Dermatology"
  | "Other";

export interface TopDrug {
  id: string;
  generic: string;
  brand: string;
  drugClass: string;
  category: DrugCategory;
  indication: string;
  ptceTip: string;
}
