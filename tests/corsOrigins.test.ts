import { describe, expect, it } from 'vitest';

function originHost(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/$/, '');
  }
}

describe('frontend origin matching', () => {
  it('treats the GitHub Pages project URL as the github.io origin', () => {
    expect(originHost('https://maheshpcse.github.io/car-system/')).toBe('https://maheshpcse.github.io');
  });
});
