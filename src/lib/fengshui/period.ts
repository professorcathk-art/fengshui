/** Nine-cycle periods of Xuan Kong, changing at Li Chun (about 4 February). */
const PERIOD_START_YEARS = [1864, 1884, 1904, 1924, 1944, 1964, 1984, 2004, 2024];

export function periodFromYear(year: number): number {
  if (!Number.isInteger(year)) {
    throw new Error("Year built must be a whole year.");
  }

  let index = 0;
  for (let i = 0; i < PERIOD_START_YEARS.length; i++) {
    if (year >= PERIOD_START_YEARS[i]) index = i;
  }

  if (year < PERIOD_START_YEARS[0]) {
    const steps = Math.floor((PERIOD_START_YEARS[0] - year - 1) / 20) + 1;
    index = -steps;
  }

  const period = ((index % 9) + 9) % 9;
  return period + 1;
}
