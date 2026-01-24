export interface Order {
  id: string;
  drinkId: string;
  drinkName: string;
  userName: string;
  userId: string;
  isNonAlcoholic: boolean;
  comment: string;
  timestamp: number;
}

export interface Drink {
  id: string;
  name: string;
  ingredients: string[];
  hasNaOption: boolean;
  color: string;
  image: string;
  fontClass: string;
  glowColor: string;
  borderColor: string;
  emoji: string;
}
