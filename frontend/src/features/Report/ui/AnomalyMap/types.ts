// frontend/src/features/Report/ui/AnomalyMap/types.ts
export interface AnomalyData {
  id: string;
  storeName: string;
  amount: number;
  date: string;
  latitude: number;
  longitude: number;
  category: string;
  paymentMethod: string;
}

export interface AnomalyMapProps {
  latitude: number;
  longitude: number;
  storeName: string;
  amount: number;
  date: string;
}
