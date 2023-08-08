const alphabet =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function genRandomString(length: number): string {
  return Array.from({ length })
    .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
    .join('');
}
