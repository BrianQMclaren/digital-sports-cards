export function getAverage(numbers: number[]) {
  const total = numbers.reduce((total, number) => {
    const newTotal = number + total;
    return newTotal;
  }, 0);

  const average = total / numbers.length;
  return average;
}
