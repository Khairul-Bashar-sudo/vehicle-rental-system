export type Vehicle = {
  id: string;
  name: string;
  type: string;
  seats: number;
  pricePerDay: number;
  image?: string;
  description?: string;
  available?: boolean;
  quantity?: number;
};
