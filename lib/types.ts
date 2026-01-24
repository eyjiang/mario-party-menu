export interface Order {
  id: string;
  drinkId: string;
  drinkName: string;
  userName: string;
  userId: string;
  isNonAlcoholic: boolean;
  timestamp: number;
}

export interface Drink {
  id: string;
  name: string;
  ingredients: string[];
  hasNaOption: boolean;
  color: string;
}
