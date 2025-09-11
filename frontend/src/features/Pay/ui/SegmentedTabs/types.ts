// src/shared/components/SegmentedTabs/types.ts
export interface SegmentedTabsProps {
  options: string[];
  value: number;
  onChange: (index: number) => void;
  height?: number;
}
