export const getRussianPluralForm = (
  value: number,
  forms: [one: string, few: string, many: string],
) => {
  const absValue = Math.abs(value);
  const mod100 = absValue % 100;
  const mod10 = absValue % 10;

  if (mod100 >= 11 && mod100 <= 14) {
    return forms[2];
  }

  if (mod10 === 1) {
    return forms[0];
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return forms[1];
  }

  return forms[2];
};