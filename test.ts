import { Datetime, toSecond, toShift } from "./src/Datetime.ts";

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
    console.log(`\u001b[37m${t} ... \u001b[32mOK\u001b[37m`);
    return;
  }
  console.log(
    `\u001b[37m${t} ... \u001b[31mfailed actual:${a} !== expected:${b}\u001b[37m`
  );
};

/**
 *
 * @param title
 * @param pattern
 */
const test = (title: string, pattern: () => void) => {
  console.log("\n* " + title);
  pattern();
};

const testByTimezone = (timezone: string) => {
  console.log(`------------------------------------------- ${timezone}`);
  process.env.TZ = timezone;

  const AT = "Asia/Tokyo";
  const PG = "Pacific/Gambier";
  const PC = "Pacific/Chatham";

  const nowContructor = () => {
    test("now constructor omitted all", () => {
      const d = new Date();
      const dt = new Datetime();
      eq("year", d.getUTCFullYear(), dt.year);
      eq("month", d.getUTCMonth(), dt.month);
      eq("day", d.getUTCDate(), dt.day);
      eq("hours", d.getUTCHours(), dt.hours);
      eq("minutes", d.getUTCMinutes(), dt.minutes);
      eq("seconds", d.getUTCSeconds(), dt.seconds);

      const ms = d.getUTCMilliseconds();
      const min = dt.milliseconds - 1;
      const max = dt.milliseconds + 1;
      eq("milliseconds", min <= ms && ms <= max, true);
    });

    test("now contstuctor specified timezone", () => {
      const ut = new Datetime(undefined);
      const at = new Datetime(undefined, AT);
      const pg = new Datetime(undefined, PG);
      const pc = new Datetime(undefined, PC);

      const utd = new Date(ut.iso8601x);
      const atd = new Date(at.iso8601x);
      const pgd = new Date(pg.iso8601x);
      const pcd = new Date(pc.iso8601x);
      eq("u==at", utd.getTime(), atd.getTime());
      eq("u==pg", utd.getTime(), pgd.getTime());
      eq("u==pa", utd.getTime(), pcd.getTime());
    });
  };

  const numberConstructor = () => {
    test("number constructor 1 UTC", () => {
      const dt = new Datetime(0);
      eq("iso8601x", dt.iso8601x, "1970-01-01T00:00:00+00:00");
      eq("time", dt.time, 0);
      eq("year", dt.year, 1970);
      eq("month", dt.month + 1, 1);
      eq("day", dt.day, 1);
      eq("hours", dt.hours, 0);
      eq("minutes", dt.minutes, 0);
      eq("seconds", dt.seconds, 0);
      eq("offset", dt.offset, 0);
      eq("offsetString", dt.offsetString, "+00:00");
      eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
      eq("date.getTime()", dt.date.getTime(), 0);
    });

    test("number constructor 2 AT", () => {
      {
        const dt = new Datetime(0, AT);
        eq("iso8601x", dt.iso8601x, "1970-01-01T09:00:00+09:00");
        eq("time", dt.time, 0);
        eq("year", dt.year, 1970);
        eq("month", dt.month + 1, 1);
        eq("day", dt.day, 1);
        eq("hours", dt.hours, 9);
        eq("minutes", dt.minutes, 0);
        eq("seconds", dt.seconds, 0);
        eq("offset", dt.offset, -540);
        eq("offsetString", dt.offsetString, "+09:00");
        eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
        eq("date.getTime()", dt.date.getTime(), 0);
      }
    });
    test("number constructor 3 PG", () => {
      {
        const dt = new Datetime(0, PG);
        eq("iso8601", dt.iso8601x, "1969-12-31T15:00:00-09:00");
        eq("time", dt.time, 0);
        eq("year", dt.year, 1969);
        eq("month", dt.month + 1, 12);
        eq("day", dt.day, 31);
        eq("hours", dt.hours, 15);
        eq("minutes", dt.minutes, 0);
        eq("seconds", dt.seconds, 0);
        eq("offset", dt.offset, 540);
        eq("offsetString", dt.offsetString, "-09:00");
        eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
        eq("date.getTime()", dt.date.getTime(), 0);
      }
    });
    test("number constructor 4 PC", () => {
      {
        const dt = new Datetime(0, PC);
        eq("iso8601x", dt.iso8601x, "1970-01-01T12:45:00+12:45");
        eq("time", dt.time, 0);
        eq("year", dt.year, 1970);
        eq("month", dt.month + 1, 1);
        eq("day", dt.day, 1);
        eq("hours", dt.hours, 12);
        eq("minutes", dt.minutes, 45);
        eq("seconds", dt.seconds, 0);
        eq("offset", dt.offset, -765);
        eq("offsetString", dt.offsetString, "+12:45");
        eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
        eq("date.getTime()", dt.date.getTime(), 0);
      }
    });

    test("number constructor 5 PC", () => {
      {
        const ut = 1000000000 * 1000;
        const dt = new Datetime(ut, AT);
        eq("iso8601x", dt.iso8601x, "2001-09-09T10:46:40+09:00");
        eq("time", dt.time, ut);
        eq("year", dt.year, 2001);
        eq("month", dt.month + 1, 9);
        eq("day", dt.day, 9);
        eq("hours", dt.hours, 10);
        eq("minutes", dt.minutes, 46);
        eq("seconds", dt.seconds, 40);
        eq("offset", dt.offset, -540);
        eq("offsetString", dt.offsetString, "+09:00");
        eq("date", dt.date.toISOString(), "2001-09-09T01:46:40.000Z");
        eq("date.getTime()", dt.date.getTime(), ut);
      }
    });
  };

  const stringConstructor = () => {
    test("string constructor", () => {
      {
        const dt = new Datetime("1970-01-01T00:00:00+00:00", AT);
        eq("timezone1", dt.iso8601x, "1970-01-01T09:00:00+09:00");
      }
      {
        const dt = new Datetime("1970-01-01T00:00:00+00:00", PG);
        eq("timezone2", dt.iso8601x, "1969-12-31T15:00:00-09:00");
      }
      {
        const dt = new Datetime("1970-01-01T00:00:00+00:00", PC);
        eq("timezone3", dt.iso8601x, "1970-01-01T12:45:00+12:45");
      }
      {
        const dt = new Datetime("1970-01-01T09:00:00+09:00", PG);
        eq("timezone4", dt.iso8601x, "1969-12-31T15:00:00-09:00");
      }
      {
        const dt = new Datetime("1970-01-01T09:00:00+09:00", "UTC");
        eq("timezone5", dt.iso8601x, "1970-01-01T00:00:00+00:00");
      }

      test("string constructor 1", () => {
        const dt = new Datetime("1970-01-01T00:00:00.000+00:00");
        eq("iso8601x", dt.iso8601x, "1970-01-01T00:00:00+00:00");
        eq("time", dt.time, 0);
        eq("year", dt.year, 1970);
        eq("month", dt.month + 1, 1);
        eq("day", dt.day, 1);
        eq("hours", dt.hours, 0);
        eq("minutes", dt.minutes, 0);
        eq("seconds", dt.seconds, 0);
        eq("offset", dt.offset, 0);
        eq("offsetString", dt.offsetString, "+00:00");
        eq("timezone", dt.timezone, "+00:00");
        eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
        eq("date.getTime()", dt.date.getTime(), 0);
      });

      test("string constructor 2", () => {
        const dt = new Datetime("1970-01-01T09:00:00.000+09:00");
        eq("iso8601x", dt.iso8601x, "1970-01-01T09:00:00+09:00");
        eq("time", dt.time, 0);
        eq("year", dt.year, 1970);
        eq("month", dt.month + 1, 1);
        eq("day", dt.day, 1);
        eq("hours", dt.hours, 9);
        eq("minutes", dt.minutes, 0);
        eq("seconds", dt.seconds, 0);
        eq("offset", dt.offset, -540);
        eq("offsetString", dt.offsetString, "+09:00");
        eq("timezone", dt.timezone, "+09:00");
        eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
        eq("date.getTime()", dt.date.getTime(), 0);
      });
    });

    test("string constructor 3(omitted offset)", () => {
      const dt = new Datetime("1970-01-01T00:00:00.000");
      eq("iso8601x", dt.iso8601x, "1970-01-01T00:00:00+00:00");
      eq("time", dt.time, 0);
      eq("year", dt.year, 1970);
      eq("month", dt.month + 1, 1);
      eq("day", dt.day, 1);
      eq("hours", dt.hours, 0);
      eq("minutes", dt.minutes, 0);
      eq("seconds", dt.seconds, 0);
      eq("offset", dt.offset, 0);
      eq("offsetString", dt.offsetString, "+00:00");
      eq("timezone", dt.timezone, "UTC");
      eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
      eq("date.getTime()", dt.date.getTime(), 0);
    });

    test("string constructor 4(omitted offset ant specified timezone Asia/Tokyo)", () => {
      const dt = new Datetime("1970-01-01T09:00:00.000", AT);
      eq("iso8601x", dt.iso8601x, "1970-01-01T09:00:00+09:00");
      eq("time", dt.time, 0);
      eq("year", dt.year, 1970);
      eq("month", dt.month + 1, 1);
      eq("day", dt.day, 1);
      eq("hours", dt.hours, 9);
      eq("minutes", dt.minutes, 0);
      eq("seconds", dt.seconds, 0);
      eq("offset", dt.offset, -540);
      eq("offsetString", dt.offsetString, "+09:00");
      eq("timezone", dt.timezone, AT);
      eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
      eq("date.getTime()", dt.date.getTime(), 0);
    });

    test("string constructor 5(omitted offset ant specified timezone Pacific/Gambier)", () => {
      const dt = new Datetime("1969-12-31T15:00:00.000", PG);
      eq("iso8601x", dt.iso8601x, "1969-12-31T15:00:00-09:00");
      eq("time", dt.time, 0);
      eq("year", dt.year, 1969);
      eq("month", dt.month + 1, 12);
      eq("day", dt.day, 31);
      eq("hours", dt.hours, 15);
      eq("minutes", dt.minutes, 0);
      eq("seconds", dt.seconds, 0);
      eq("offset", dt.offset, +540);
      eq("offsetString", dt.offsetString, "-09:00");
      eq("timezone", dt.timezone, PG);
      eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
      eq("date.getTime()", dt.date.getTime(), 0);
    });

    test("string constructor 6(omitted offset ant specified timezone Pacific/Chathm)", () => {
      const dt = new Datetime("1970-01-01T12:45:00.000", PC);
      eq("iso8601x", dt.iso8601x, "1970-01-01T12:45:00+12:45");
      eq("time", dt.time, 0);
      eq("year", dt.year, 1970);
      eq("month", dt.month + 1, 1);
      eq("day", dt.day, 1);
      eq("hours", dt.hours, 12);
      eq("minutes", dt.minutes, 45);
      eq("seconds", dt.seconds, 0);
      eq("offset", dt.offset, -765);
      eq("offsetString", dt.offsetString, "+12:45");
      eq("timezone", dt.timezone, PC);
      eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
      eq("date.getTime()", dt.date.getTime(), 0);
    });
  };

  const datetimeConstructor = () => {
    test("datetime constructor 1", () => {
      const org = new Datetime("1970-01-01T12:45:00.000", PC);
      const dt = new Datetime(org);
      eq("iso8601x", dt.iso8601x, "1970-01-01T12:45:00+12:45");
      eq("time", dt.time, 0);
      eq("year", dt.year, 1970);
      eq("month", dt.month + 1, 1);
      eq("day", dt.day, 1);
      eq("hours", dt.hours, 12);
      eq("minutes", dt.minutes, 45);
      eq("seconds", dt.seconds, 0);
      eq("offset", dt.offset, -765);
      eq("offsetString", dt.offsetString, "+12:45");
      eq("timezone", dt.timezone, PC);
      eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
      eq("date.getTime()", dt.date.getTime(), 0);
    });

    test("datetime constructor 2 PC->AT", () => {
      const org = new Datetime("1970-01-01T12:45:00.000", PC);
      eq("org.iso8601x", org.iso8601x, "1970-01-01T12:45:00+12:45");
      const dt = new Datetime(org, AT);
      eq("iso8601x", dt.iso8601x, "1970-01-01T09:00:00+09:00");
      eq("time", dt.time, 0);
      eq("year", dt.year, 1970);
      eq("month", dt.month + 1, 1);
      eq("day", dt.day, 1);
      eq("hours", dt.hours, 9);
      eq("minutes", dt.minutes, 0);
      eq("seconds", dt.seconds, 0);
      eq("offset", dt.offset, -540);
      eq("offsetString", dt.offsetString, "+09:00");
      eq("timezone", dt.timezone, AT);
      eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
      eq("date.getTime()", dt.date.getTime(), 0);
    });

    test("datetime constructor 3 AT->PG", () => {
      const org = new Datetime("1970-01-01T09:00:00.000", AT);
      eq("org.iso8601x", org.iso8601x, "1970-01-01T09:00:00+09:00");
      const dt = new Datetime(org, PG);
      eq("iso8601x", dt.iso8601x, "1969-12-31T15:00:00-09:00");
      eq("time", dt.time, 0);
      eq("year", dt.year, 1969);
      eq("month", dt.month + 1, 12);
      eq("day", dt.day, 31);
      eq("hours", dt.hours, 15);
      eq("minutes", dt.minutes, 0);
      eq("seconds", dt.seconds, 0);
      eq("offset", dt.offset, 540);
      eq("offsetString", dt.offsetString, "-09:00");
      eq("timezone", dt.timezone, PG);
      eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
      eq("date.getTime()", dt.date.getTime(), 0);
    });

    test("datetime constructor 4 PC->UT", () => {
      const org = new Datetime("1970-01-01T12:45:00.000", PC);
      eq("org.iso8601x", org.iso8601x, "1970-01-01T12:45:00+12:45");
      const dt = new Datetime(org, "UTC");
      eq("iso8601x", dt.iso8601x, "1970-01-01T00:00:00+00:00");
      eq("time", dt.time, 0);
      eq("year", dt.year, 1970);
      eq("month", dt.month + 1, 1);
      eq("day", dt.day, 1);
      eq("hours", dt.hours, 0);
      eq("minutes", dt.minutes, 0);
      eq("seconds", dt.seconds, 0);
      eq("offset", dt.offset, 0);
      eq("offsetString", dt.offsetString, "+00:00");
      eq("timezone", dt.timezone, "UTC");
      eq("date", dt.date.toISOString(), "1970-01-01T00:00:00.000Z");
      eq("date.getTime()", dt.date.getTime(), 0);
    });
  };

  const shiftConstructor = () => {
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
    test("secondToShift", () => {
      const sh = toShift(273906.789);
      eq("day", sh.days, 3);
      eq("hours", sh.hours, 4);
      eq("minutes", sh.minutes, 5);
      eq("seconds", sh.seconds, 6);
      eq("milliseconds", sh.milliseconds, 789);
    });

    test("now shift", () => {
      const shift = {
        days: 3,
        hours: 4,
        minutes: 5,
        seconds: 6,
        milliseconds: 789,
      };
      const sec = toSecond(shift) * 1000;
      const now = new Datetime();
      const shi = new Datetime(shift);
      const min = now.time - 1;
      const max = now.time + 1;
      const val = shi.time - sec;
      eq("shifted", min <= val && val <= max, true);
    });
    test("shift from now", () => {
      const date = new Date();
      const now = new Datetime(undefined);
      const sh1 = new Datetime({ seconds: 0 });
      const sh2 = new Datetime({ seconds: 0 }, AT);
      const sh3 = new Datetime({ seconds: 0 }, PG);
      const sh4 = new Datetime({ seconds: 0 }, PC);
      const sh5 = new Datetime({ seconds: 1 });
      const sh6 = new Datetime({ seconds: 2 }, AT);
      const sh7 = new Datetime({ seconds: 3 }, PG);
      const sh8 = new Datetime({ seconds: 4 }, PC);

      eq("sh1", now.unixtime, sh1.unixtime);
      eq("sh2", now.unixtime, sh2.unixtime);
      eq("sh3", now.unixtime, sh3.unixtime);
      eq("sh4", now.unixtime, sh4.unixtime);
      eq("sh5", now.unixtime, sh5.unixtime - 1);
      eq("sh6", now.unixtime, sh6.unixtime - 2);
      eq("sh7", now.unixtime, sh7.unixtime - 3);
      eq("sh8", now.unixtime, sh8.unixtime - 4);

      const ut = Math.floor(date.getTime() / 1000);
      eq("compat", now.unixtime, ut);
      eq("compat1", sh1.unixtime, ut);
      eq("compat2", sh2.unixtime, ut);
      eq("compat3", sh3.unixtime, ut);
      eq("compat4", sh4.unixtime, ut);
      eq("compat5", sh5.unixtime, ut + 1);
      eq("compat6", sh6.unixtime, ut + 2);
      eq("compat7", sh7.unixtime, ut + 3);
      eq("compat8", sh8.unixtime, ut + 4);

      {
        const now = new Datetime(undefined, AT);
        const shi = new Datetime({ seconds: 1 }, PG);
        eq("now shift 2", now.unixtime, shi.unixtime - 1);
      }
    });

    test("shift from static date", () => {
      const now = new Datetime("1970-01-01T12:45:00+12:45", PC);
      const dt = now.shift({ seconds: 10 });
      eq("shift1", now.unixtime, dt.unixtime - 10);

      eq("iso8601x", dt.iso8601x, "1970-01-01T12:45:10+12:45");
      eq("time", dt.time, 10 * 1000);
      eq("year", dt.year, 1970);
      eq("month", dt.month + 1, 1);
      eq("day", dt.day, 1);
      eq("hours", dt.hours, 12);
      eq("minutes", dt.minutes, 45);
      eq("seconds", dt.seconds, 10);
      eq("offset", dt.offset, -765);
      eq("offsetString", dt.offsetString, "+12:45");
      eq("timezone", dt.timezone, PC);
      eq("date", dt.date.toISOString(), "1970-01-01T00:00:10.000Z");
      eq("date.getTime()", dt.date.getTime(), 10 * 1000);
    });
  };

  const timezoneTo = () => {
    test("timezone to 1", () => {
      const utc = new Datetime("2000-01-01T00:00:00");
      const at = utc.toTimezone(AT);
      eq("timezone", at.iso8601x, "2000-01-01T09:00:00+09:00");
      const pc = at.toTimezone(PC);
      eq("timezone", pc.iso8601x, "2000-01-01T12:45:00+12:45");
      const pg = pc.toTimezone(PG);
      eq("timezone", pg.iso8601x, "1999-12-31T15:00:00-09:00");
      const ut = pg.toTimezone("UTC");
      eq("timezone", ut.iso8601x, "2000-01-01T00:00:00+00:00");
    });
  };

  const clockConstructor = () => {
    test("clock", () => {
      Datetime.setClock("2050-06-02T15:21:13");
      eq("clock", new Datetime().format("y-m-dTh:i:s"), "2050-06-02T15:21:13");
      Datetime.resetClock();
    });
  };

  nowContructor();
  numberConstructor();
  stringConstructor();
  datetimeConstructor();
  shiftConstructor();
  timezoneTo();
  clockConstructor();
};

testByTimezone("utc");
testByTimezone("Asia/Tokyo");
testByTimezone("Pacific/Gambier");
testByTimezone("Pacific/Chatham");
