export const randomHex = (length: number = 10): string => {
  return Math.random().toString(16).substring(2, 2 + length);
};

export const generateId = (): string => {
  const hex = '0123456789abcdef';
  const sections = [8, 4, 4, 4, 12];
  return sections.map((len) => {
    let s = '';
    for (let i = 0; i < len; i++) s += hex[Math.floor(Math.random() * 16)];
    return s;
  }).join('-');
};
