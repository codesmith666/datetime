import { Datetime, toSecond } from "./src/Datetime.ts";

/**
 *
 * @param t
 * @param a
 * @param b
 * @returns
 */
const eq = (t: string, a: any, b: any) => {
  if (Number.isNaN(a) && Number.isNaN(b)) return;
  if (a === b) {
    console.error(`${t} ... \u001b[32mOK\u001b[37m`);
    return;
  }
  console.error(
    `${t} ... \u001b[31mfailed actual:${a} !== expected:${b}\u001b[37m`
  );
};

/**
 *
 * @param title
 * @param pattern
 */
const test = (title: string, pattern: () => void) => {
  console.log("* " + title);
  pattern();
};

const AT = "Asia/Tokyo";
const PG = "Pacific/Gambier";

/**
 * constructor test
 */
test("Constructor test", () => {
  // null
  const dt = new Datetime();
  eq("now", dt.time, dt.date.getTime());

  // unixtime
  eq("unixtime", new Datetime(0).time, 0);

  // string
  {
    const dt = new Datetime("2024-06-01T22:55:30.123+09:00");
    eq("string1", dt.format(), "2024-06-01T22:55:30.123+09:00");
    eq("string2", dt.timezone, "+09:00"); // spec
    eq("string3", dt.offsetString, "+09:00");
    const dt2 = new Datetime("2024-06-01T22:55:30.123", AT);
    eq("string4", dt2.format(), "2024-06-01T22:55:30.123+09:00");
    eq("string5", dt2.timezone, AT);
    eq("string6", dt2.offsetString, "+09:00");
  }
  // date
  {
    const dt = new Datetime(new Date(12345));
    eq("date1", dt.format(), "1970-01-01T00:00:12.345+00:00");

    const dt2 = new Datetime(new Date("2024-06-01T23:25:34"), AT);
    eq("date2", dt2.format(), "2024-06-01T23:25:34.000+09:00");
  }
  // datetime
  {
    const dt = new Datetime(new Datetime(12345, AT));
    eq("datetime1", dt.format(), "1970-01-01T00:00:12.345+09:00");
    eq("datetime2", dt.timezone, AT);
  }
  // shift
  {
    const dt = new Datetime(0, AT).shift({
      years: 1,
      months: 2,
      days: 3,
      hours: 4,
      minutes: 5,
      seconds: 6,
      milliseconds: 789,
    });
    eq("shift", dt.format(), "1971-03-04T04:05:06.789+09:00");
  }
});

/**
 * Unix epoch time test
 */
test("Unix epoch time test", () => {
  const ut = 0;
  const dt = new Datetime(ut);
  eq("unixtime construct", dt.time, ut);
  eq("format", dt.format(), "1970-01-01T00:00:00.000+00:00");

  const at = dt.toTimezone(AT);
  eq("to Asia/Tokyo time", at.format(), "1970-01-01T09:00:00.000+09:00");
  eq("that ut", at.time, ut);

  const pg = dt.toTimezone(PG);
  eq("to Pacific/Gambier time", pg.format(), "1969-12-31T15:00:00.000-09:00");
  eq("that ut", pg.time, ut);

  const at2pg = at.toTimezone(PG);
  eq(
    "to Pacific/Gambier time",
    at2pg.format(),
    "1969-12-31T15:00:00.000-09:00"
  );
  eq("that ut", at2pg.time, ut);
});

test("Similar tests", () => {
  const ut = 946782245678;
  const dt = new Datetime(ut);

  eq("unixtime construct", dt.time, ut);
  eq("format", dt.format(), "2000-01-02T03:04:05.678+00:00");

  const at = dt.toTimezone(AT);
  eq("to Asia/Tokyo time", at.format(), "2000-01-02T12:04:05.678+09:00");
  eq("that ut", at.time, ut);

  const pg = dt.toTimezone(PG);
  eq("to Pacific/Gambier time", pg.format(), "2000-01-01T18:04:05.678-09:00");
  eq("that ut", pg.time, ut);

  const at2pg = at.toTimezone(PG);
  eq(
    "to Pacific/Gambier time",
    at2pg.format(),
    "2000-01-01T18:04:05.678-09:00"
  );
  eq("that ut", at2pg.time, ut);
});

test("Timezone conversion", () => {
  const utc = new Datetime("1970-01-01T00:00:00", "utc");
  const at = utc.toTimezone("Asia/Tokyo");

  console.log(utc.toTimezone("Asia/Tokyo").toString());

  eq("utc->AsiaTokyo", at.toString(), "1970-01-01T09:00:00+09:00");
});

test("Getter test", () => {
  const dt = new Datetime("2000-01-02T03:04:05.678", AT);
  const past = "2000-01-02T03:04:05.677+09:00";
  const future = "2000-01-02T03:04:05.679+09:00";

  eq("iso8601x", dt.iso8601x, "2000-01-02T03:04:05+09:00");
  eq("timezone", dt.timezone, AT);
  eq("year", dt.year, 2000);
  eq("month", dt.month, 0);
  eq("day", dt.day, 2);
  eq("hours", dt.hours, 3);
  eq("minutes", dt.minutes, 4);
  eq("seconds", dt.seconds, 5);
  eq("milliseconds", dt.milliseconds, 678);
  eq("offset", dt.offset, -540);
  eq("zone", dt.offsetString, "+09:00");
  eq("date", dt.date.getTime(), dt.time);

  eq("after1", dt.isAfter(past), true);
  eq("after2", dt.isAfter(future), false);
  eq("before1", dt.isBefore(past), false);
  eq("before2", dt.isBefore(future), true);
});

test("Shift to second", () => {
  const shift = {
    days: 3,
    hours: 4,
    minutes: 5,
    seconds: 6,
    milliseconds: 789,
  };
  eq("test", toSecond(shift), 273906.789);
});

test("clock", () => {
  Datetime.setClock("2050-06-02T15:21:13");
  eq("clock", new Datetime().format("y-m-dTh:i:s"), "2050-06-02T15:21:13");
});
