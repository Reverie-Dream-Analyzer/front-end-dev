export type ZodiacSign = {
  sign: string;
  symbol: string;
  element: string;
  traits: string[];
  dates: string;
};

export type UserProfile = {
  name: string;
  birthday: string;
  favoriteElement: string;
  dreamGoals: string[];
  zodiacSign: ZodiacSign;
};
