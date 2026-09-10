// Headless regression tests for TimeZone — Intl-based zone conversion.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');

const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(m => m[1]).sort((a, b) => b.length - a.length)[0];

function el(){ return {value:'',textContent:'',innerHTML:'',style:{},className:'',
  appendChild(){},getAttribute(){return null;},setAttribute(){},removeAttribute(){},
  classList:{add(){},remove(){},toggle(){}},
  addEventListener(){},querySelectorAll(){return[];},querySelector(){return null;},closest(){return null;}}; }
globalThis.document = {
  getElementById: () => el(), createElement: () => el(), querySelector: () => el(),
  querySelectorAll: () => [], documentElement: el()
};
globalThis.localStorage = { getItem:()=>null, setItem(){}, removeItem(){} };
globalThis.matchMedia = () => ({ matches:false });
globalThis.window = { matchMedia: globalThis.matchMedia };

eval(js.replace('if(typeof module !== \'undefined\') module.exports =',
  'globalThis.__t =') );
const { zoneOffsetMinutes, wallTimeToInstant, partsInZone, offsetLabel, dayDiff } = globalThis.__t;

let n = 0;
const check = (name, fn) => { fn(); n++; console.log('  ok -', name); };

const jan = new Date('2024-01-15T12:00:00Z');
const jul = new Date('2024-07-15T12:00:00Z');

check('zoneOffsetMinutes — fixed-offset zones', () => {
  assert.equal(zoneOffsetMinutes('UTC', jan), 0);
  assert.equal(zoneOffsetMinutes('Asia/Kolkata', jan), 330);   // +5:30 year-round
  assert.equal(zoneOffsetMinutes('Asia/Tokyo', jan), 540);     // +9 year-round
  assert.equal(zoneOffsetMinutes('Asia/Dubai', jan), 240);     // +4 year-round
});

check('zoneOffsetMinutes — DST-aware (New York)', () => {
  assert.equal(zoneOffsetMinutes('America/New_York', jan), -300); // EST
  assert.equal(zoneOffsetMinutes('America/New_York', jul), -240); // EDT
});

check('zoneOffsetMinutes — DST-aware (London)', () => {
  assert.equal(zoneOffsetMinutes('Europe/London', jan), 0);   // GMT
  assert.equal(zoneOffsetMinutes('Europe/London', jul), 60);  // BST
});

check('wallTimeToInstant — 9am EST is 14:00 UTC', () => {
  const inst = wallTimeToInstant('America/New_York', 2024, 1, 15, 9, 0);
  assert.equal(inst.getTime(), Date.UTC(2024, 0, 15, 14, 0));
});

check('wallTimeToInstant — 9am EDT (July) is 13:00 UTC', () => {
  const inst = wallTimeToInstant('America/New_York', 2024, 7, 15, 9, 0);
  assert.equal(inst.getTime(), Date.UTC(2024, 6, 15, 13, 0));
});

check('wallTimeToInstant — UTC identity', () => {
  const inst = wallTimeToInstant('UTC', 2024, 3, 10, 8, 30);
  assert.equal(inst.getTime(), Date.UTC(2024, 2, 10, 8, 30));
});

check('partsInZone — formats local wall time', () => {
  const p = partsInZone(new Date('2024-01-15T14:00:00Z'), 'Asia/Kolkata');
  assert.equal(p.time, '19:30');       // 14:00 UTC + 5:30
  assert.equal(p.date, '2024-01-15');
  const p2 = partsInZone(new Date('2024-01-15T23:00:00Z'), 'Asia/Tokyo');
  assert.equal(p2.time, '08:00');      // next day in Tokyo
  assert.equal(p2.date, '2024-01-16');
});

check('offsetLabel — formats minutes', () => {
  assert.equal(offsetLabel(330), 'UTC+05:30');
  assert.equal(offsetLabel(-300), 'UTC-05:00');
  assert.equal(offsetLabel(0), 'UTC+00:00');
  assert.equal(offsetLabel(540), 'UTC+09:00');
});

check('dayDiff — calendar day delta between ISO dates', () => {
  assert.equal(dayDiff('2024-01-15', '2024-01-16'), 1);
  assert.equal(dayDiff('2024-01-15', '2024-01-14'), -1);
  assert.equal(dayDiff('2024-01-15', '2024-01-15'), 0);
  assert.equal(dayDiff('2024-02-28', '2024-03-01'), 2); // leap year
});

check('round-trip: wall time -> instant -> parts in same zone', () => {
  const inst = wallTimeToInstant('Australia/Sydney', 2024, 6, 1, 9, 0);
  const p = partsInZone(inst, 'Australia/Sydney');
  assert.equal(p.time, '09:00');
  assert.equal(p.date, '2024-06-01');
});

console.log(`\n${n} checks passed.`);
