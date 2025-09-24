export interface SaleEventListItem {
  id: string;
  merchant: string;
  title: string;
  period: string; // 예: "9/21 ~ 9/23"
  note?: string;
  color: "yellow" | "blue" | "green" | "purple" | "orange" | "pink";
}

export interface SaleEventListProps {
  items: SaleEventListItem[];
}
