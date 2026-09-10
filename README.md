# TimeZone

**Time zone converter & meeting planner** — pick a time in one zone and see it in cities around the world at once, with correct daylight-saving offsets and day-difference markers. One offline HTML file, no signup, no tracking.

👉 **[Open TimeZone](https://awictor.github.io/tz-convert/)**

## Features
- Convert a wall-clock time from any listed zone to ~18 major cities instantly
- DST-aware — offsets are computed for the chosen date, so a schedule survives a DST switch
- `+1` / `−1` markers when the local time falls on a different calendar day
- Defaults to your browser's zone; "use current time" button; dark mode
- 100% client-side (uses your browser's time-zone database); works offline

## Why
"9am my time next Tuesday — what's that for the London and Tokyo folks?" is a daily question for distributed teams, and DST makes eyeballing it error-prone. TimeZone answers it exactly, offline. Part of the [Toolkit](https://awictor.github.io/toolkit/).

## Tests
```
node tests/selftest.mjs
```
Pure functions (`zoneOffsetMinutes`, `wallTimeToInstant`, `partsInZone`, `offsetLabel`, `dayDiff`) are covered by headless tests with fixed dates — DST-aware New York/London offsets, IST/JST, and wall-time round-trips; CI runs them on every push.

## License
MIT © Alex Wictor
