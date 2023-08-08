export const fillArray = (length: number) => {
  const arr: number[] = [];

  for (let i = 1; i <= length; i++) {
    arr.push(i);
  }

  return arr;
};
