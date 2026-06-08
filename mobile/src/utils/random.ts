export const randomHex = (length: number = 10): string => {
  return Math.random().toString(16).substring(2, 2 + length);
};
