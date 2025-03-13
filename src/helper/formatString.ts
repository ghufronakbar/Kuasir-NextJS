export const convertToReadableString = (input: string): string =>
  input.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
