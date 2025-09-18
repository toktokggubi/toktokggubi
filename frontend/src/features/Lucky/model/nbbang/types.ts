export interface Participant {
  id: string;
  name: string;
  weight: number; // 1 = 균등, 2 = 두 배 부담 등
}

export interface ShareItem {
  id: string;
  name: string;
  amount: number;
}

export interface UseNbbangCalcParams {
  total: number;
  roundUnit: number;
  participants: Participant[];
}
