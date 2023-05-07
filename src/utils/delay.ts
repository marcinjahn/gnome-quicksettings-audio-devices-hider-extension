export function delay(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), milliseconds);
  });
}
