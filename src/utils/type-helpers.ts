export const isDefined = <T>(x?: T | null): x is T =>
  x !== null || x !== undefined;
