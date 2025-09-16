export type GifticonSort = "createdAtDesc" | "remainingAsc";

export interface GifticonSortTabsProps {
  value: GifticonSort;
  onChange: (next: GifticonSort) => void;
}
