# @nence/datetime

## Feature

- Datetime class that support timezone conversion.
- It also supports date and time disguising.

## Install

```
npm install @nence/datetime
```

## Sample

https://github.com/codesmith666/datetime/blob/main/test.ts

## How to use

### Constructor

```typescript
const dt1 = new Datetime(); // now(utc)
const dt2 = new Datetime(undefined, "Asia/Tokyo"); // now(Asia/Tokyo)
const dt3 = new Datetime(0); // 1970-01-01T00:00:00+00:00
const dt4 = new Datetime("2024-06-03T20:01:23", "Asia/Tokyo"); // 2024-06-03T20:01:23+09:00
const dt5 = new Datetime("2024-06-03T20:01:23+09:00"); // 2024-06-03T20:01:23+09:00
const dt6 = new Datetime(new Datetime()); // copy
const dt7 = new Datetime({ seconds: 60 }, "Asia/Tokyo"); // 60 seconds from the present
```

### Timezone conversion

```typescript
const ut = 946782245678;
const dt = new Datetime(ut);

console.log(dt.format()); // "2000-01-02T03:04:05.678+00:00"

const at = dt.toTimezone("Asia/Tokyo");
console.log(at.format()); // "2000-01-02T12:04:05.678+09:00"

const pg = at.toTimezone("Pasific/Gambier");
console.log(pg.format()); // "2000-01-01T18:04:05.678-09:00"
```

### format()

- default argument is "y-m-dTh:i:s.lz".

```typescript
const dt = new Datetime();
console.log(dt.format()); // "2024-06-02T17:29:15.213+00:00"
console.log(dt.format("y-m-d")); // "2024-06-02"
```

### iso8601x

- same as format("y-m-dTh:i:sz");

```typescript
const dt = new Datetime();
console.log(dt.iso8601x); // "2024-06-02T17:29:15+00:00"
```

### timezone

```typescript
const dt1 = new Datetime("2024-06-03T20:37:12", "Asia/Tokyo");
console.log(dt1.timezone); // Asia/Tokyo

const dt2 = new Datetime("2024-06-03T20:37:12+09:00");
console.log(dt2.timezone); // +09:00
```

## Disguising

```typescript
// set clock
Datetime.setClock("2050-06-02T15:21:13");

// get now
new Datetime().format("y-m-dTh:i:s"); // "2050-06-02T15:21:13"
```

EOF
