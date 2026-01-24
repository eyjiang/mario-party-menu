export interface Order {
  id: string;
  drinkId: string;
  drinkName: string;
  userName: string;
  userId: string;
  isNonAlcoholic: boolean;
  comment: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
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

export interface SecretMessage {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message: string;
  timestamp: number;
}

export interface Photo {
  id: string;
  userId: string;
  userName: string;
  dataUrl: string;
  timestamp: number;
}
