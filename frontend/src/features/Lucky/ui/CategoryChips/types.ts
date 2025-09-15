export interface CategoryChipsProps {
  value: "cafe" | "movie" | "shopping" | "life" | "burger" | "etc";
  onChange: (next: CategoryChipsProps["value"]) => void;
}
