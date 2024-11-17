import { expect } from '@jest/globals';

function areDatesEqual(a: unknown, b: unknown): boolean | undefined {
  const isADate = a instanceof Date;
  const isBDate = b instanceof Date;

  if (isADate && isBDate) {
    return a.getTime() === b.getTime();
  } else if (isADate === isBDate) {
    return undefined;
  } else {
    return false;
  }
}

expect.addEqualityTesters([areDatesEqual]);
