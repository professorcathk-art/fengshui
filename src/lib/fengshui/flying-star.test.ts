import assert from "node:assert/strict";
import test from "node:test";
import { flyingStar } from "./flying-star";
import { lifeGua } from "./kua";
import { periodFromYear } from "./period";
import { remedyText } from "./remedies";

test("period years follow the 20-year cycles", () => {
  assert.equal(periodFromYear(1943), 4);
  assert.equal(periodFromYear(2003), 7);
  assert.equal(periodFromYear(2004), 8);
  assert.equal(periodFromYear(2023), 8);
  assert.equal(periodFromYear(2024), 9);
});

test("period 8 facing due south is the published double-facing chart", () => {
  const chart = flyingStar({ period: 8, facingDegree: 180 });
  assert.equal(chart.facing.character, "午");
  assert.equal(chart.sitting.character, "子");
  assert.equal(chart.waterFliesForward, false);
  assert.equal(chart.mountainFliesForward, true);
  assert.equal(chart.kind, "double-facing");

  const north = chart.palaces.find((palace) => palace.id === "N");
  const south = chart.palaces.find((palace) => palace.id === "S");
  assert.deepEqual(
    [north?.mountain, north?.period, north?.water],
    [9, 4, 7],
  );
  assert.deepEqual(
    [south?.mountain, south?.period, south?.water],
    [8, 3, 8],
  );
});

test("traditional Chinese remedies name the five yellow star", () => {
  const chart = flyingStar({ period: 8, facingDegree: 180 });
  const text = remedyText(chart, null, "zh-Hant");
  assert.match(text, /五黃/);
  assert.doesNotMatch(text, /\$/);
});

test("life gua uses the 4 February year boundary", () => {
  assert.equal(lifeGua("1980-06-01", "male").kua, 2);
  assert.equal(lifeGua("1980-06-01", "male").group, "West");
  assert.equal(lifeGua("1984-08-01", "male").kua, 7);
  assert.equal(lifeGua("1978-05-01", "female").kua, 2);
  assert.equal(lifeGua("1995-07-01", "male").kua, 2);
  assert.equal(lifeGua("1980-01-15", "male").yearUsed, 1979);
});
