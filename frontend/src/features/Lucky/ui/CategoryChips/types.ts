import type { Category } from "@/shared/constants/categories";

export interface CategoryChipsProps {
  value: Category;
  onChange: (next: Category) => void;
}
