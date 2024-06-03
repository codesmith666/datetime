export type Shift = {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

export const isShift = (source: object): source is Shift => {
  return (
    (source as Shift)?.years !== undefined ||
    (source as Shift)?.months !== undefined ||
    (source as Shift)?.days !== undefined ||
    (source as Shift)?.hours !== undefined ||
    (source as Shift)?.minutes !== undefined ||
    (source as Shift)?.seconds !== undefined ||
    (source as Shift)?.milliseconds !== undefined
  );
};

export const toSecond = (shift: Shift) => {
  if (shift.years) return Number.NaN;
  if (shift.months) return Number.NaN;

  let sec = 0;
  sec += (shift.milliseconds || 0) * 0.001;
  sec += shift.seconds || 0;
  sec += (shift.minutes || 0) * 60;
  sec += (shift.hours || 0) * 60 * 60;
  sec += (shift.days || 0) * 60 * 60 * 24;
  return sec;
};

export const toShift = (seconds: number): Shift => {
  let mod = seconds;
  const da = Math.floor(mod / (60 * 60 * 24));
  mod = mod % (60 * 60 * 24);
  const ho = Math.floor(mod / (60 * 60));
  mod = mod % (60 * 60);
  const mi = Math.floor(mod / 60);
  mod = mod % 60;
  const se = Math.floor(mod);
  const ms = (mod * 1000) % 1000;
  return { days: da, hours: ho, minutes: mi, seconds: se, milliseconds: ms };
};

type Source = string | number | Date | Datetime | Shift | undefined | null;

/**
 *
 */
export class Datetime {
  private dt: Date; // Timezone date and time are stored. not UTC.
  private tz: string = undefined!; // Timezone of this.date.

  /**
   * constructor
   *
   * @param source Original date representation to initialize the object
   * @param timezone Time zone for display
   */
  constructor(source?: Source, timezone?: string) {
    // If source is null or undefined, initialize with the current date and time.
    if (source === null || source === undefined) {
      this.dt = new Date(new Date().getTime() + Datetime.gap);
      this.tz = timezone ?? "utc";
      return;
    }

    // If the source is a numeric type, initialize as unixtime in milliseconds.
    else if (typeof source === "number") {
      this.dt = new Date(source);
      this.tz = timezone ?? "utc";
      return;
    }

    // If the source is a string, initialize it as a string in ISO8601 notation.
    if (typeof source === "string") {
      // If offset is specified, separate and initialize date as utc
      // This is because the Date class calculates the offset and stores it as UTC.
      const m = source.match(/^(.*?)([-+]\d?\d:\d?\d)$/);
      if (m) {
        this.dt = new Date(m[1]);
        // Check offset confliction.
        const srcOffset = Datetime.stringToOffset(m[2]);

        // When source offset is omitted.
        if (srcOffset === undefined) {
          this.tz = timezone || "utc";
          return;
        }

        // When source offset is specified,ignore timezone
        const tzOffset = Datetime.stringToOffset(timezone);
        if (timezone === undefined) {
          this.tz = Datetime.offsetToString(srcOffset);
          return;
        }

        // Source offset and specified timezone collided.
        this.tz = timezone;
        if (srcOffset !== tzOffset) {
          const arg1 = `offset of arg1 - "${source}"`;
          const arg2 = `arg2 - "${timezone}"`;
          console.error(
            `warning: Adopt ${arg2} and ignore ${arg1} at new Datetime().`
          );
        }
      } else {
        this.dt = new Date(source);
        this.tz = timezone || "utc";
      }
      return;
    }

    // If the source is a Date object, initialize with it.
    if (source instanceof Date) {
      this.dt = new Date(source);
      this.tz = timezone ?? "utc";
      return;
    }

    // If source is a Datetime object, initialize with it.
    if (source instanceof Datetime) {
      this.dt = new Date(source.dt);
      this.tz = source.tz;
      return;
    }

    // If source is a Shift object, initialize with shifted current time.
    if (isShift(source)) {
      this.dt = new Datetime().shift(source).dt;
      this.tz = timezone ?? "utc";
      return;
    }

    // If any other type is specified, throw an exception and exit.
    console.error("--------------------------------");
    console.error("could not initialize Datetime.");
    console.error(source);
    console.error("--------------------------------");
    throw "could not initialize Datetime.";
  }

  /**
   * Returns a new object with the timezone converted.
   *
   * @param timezone
   */
  toTimezone(timezone: string) {
    const src = Datetime.stringToOffset(this.tz)! * 60 * 1000;
    const dst = Datetime.stringToOffset(timezone)! * 60 * 1000;
    const date = new Date(this.dt.getTime() + src - dst);
    return new Datetime(date, timezone);
  }

  shift(shift: Shift) {
    const ye = shift.years ?? 0;
    const mo = shift.months ?? 0;
    const da = shift.days ?? 0;
    const ho = shift.hours ?? 0;
    const mi = shift.minutes ?? 0;
    const se = shift.seconds ?? 0;
    const ms = shift.milliseconds ?? 0;

    const date = new Date(this.dt);
    date.setFullYear(this.dt.getFullYear() + ye);
    date.setMonth(this.dt.getMonth() + mo);
    date.setDate(this.dt.getDate() + da);
    date.setHours(this.dt.getHours() + ho);
    date.setMinutes(this.dt.getMinutes() + mi);
    date.setSeconds(this.dt.getSeconds() + se);
    date.setMilliseconds(this.dt.getMilliseconds() + ms);

    return new Datetime(date, this.tz);
  }

  get time() {
    const msut = this.dt.getTime();
    const offset = Datetime.stringToOffset(this.tz)! * 60 * 1000;
    return msut + offset;
  }
  get unixtime(){
    return Math.floor(this.time/1000);
  }
  get year() {
    return this.dt.getFullYear();
  }
  get month() {
    return this.dt.getMonth();
  }
  get day() {
    return this.dt.getDate();
  }
  get hours() {
    return this.dt.getHours();
  }
  get minutes() {
    return this.dt.getMinutes();
  }
  get seconds() {
    return this.dt.getSeconds();
  }
  get milliseconds() {
    return this.dt.getMilliseconds();
  }
  get timezone() {
    return this.tz;
  }
  get date() {
    return this.toTimezone("utc").dt;
  }
  get offset() {
    return Datetime.stringToOffset(this.tz);
  }
  get offsetString() {
    return Datetime.offsetToString(Datetime.stringToOffset(this.tz)!);
  }
  get iso8601x() {
    return this.format("y-m-dTh:i:sz");
  }

  /**
   *
   */
  isAfter(date: Source, timezone?: string) {
    return this.time > new Datetime(date, timezone).time;
  }
  isBefore(date: Source, timezone?: string) {
    return this.time < new Datetime(date, timezone).time;
  }

  /**
   *
   */
  format(fmt: string = "y-m-dTh:i:s.lz") {
    return Datetime.format(
      this.dt.getFullYear(),
      this.dt.getMonth() + 1,
      this.dt.getDate(),
      this.dt.getHours(),
      this.dt.getMinutes(),
      this.dt.getSeconds(),
      this.dt.getMilliseconds(),
      this.tz,
      fmt
    );
  }

  /**
   *
   */
  toString() {
    return this.iso8601x;
  }

  /**
   *
   * @param y
   * @param m
   * @param d
   * @param h
   * @param i
   * @param s
   * @param l
   * @param t
   * @param format
   * @returns
   */
  static format(
    y = 0,
    m = 0,
    d = 1,
    h = 0,
    i = 0,
    s = 0,
    l = 0,
    t = "utc",
    format = "y-m-dTh:i:s.lz"
  ) {
    format = format.replace("y", ("0000" + y).slice(-4));
    format = format.replace("m", ("00" + m).slice(-2));
    format = format.replace("d", ("00" + d).slice(-2));
    format = format.replace("h", ("00" + h).slice(-2));
    format = format.replace("i", ("00" + i).slice(-2));
    format = format.replace("s", ("00" + s).slice(-2));
    format = format.replace("l", ("000" + l).slice(-3));
    format = format.replace("z", this.offsetToString(this.stringToOffset(t)!));
    return format;
  }

  /**
   * Convert time zone string or offset string to offset (minutes).
   *
   * @param timezone
   * @returns
   */
  static stringToOffset(source?: string) {
    // undefined
    if (source === undefined) return undefined;

    // offset notation
    const m = source.match(/^([-+])(\d?\d):(\d?\d)$/);
    if (m) {
      const hour = parseInt(m[2]);
      const minute = parseInt(m[3]);
      return (hour * 60 + minute) * (m[1] === "-" ? 1 : -1) || 0; // NG:-0
    }
    // utc
    if (source.match(/z$/i) || source === "utc") {
      return 0;
    }
    // timezone notation
    if (source.match(/^[A-Za-z]+\/[A-Za-z]+$/)) {
      const date = new Date("1970-01-01T00:00:00");
      const local = new Date(date.toLocaleString("utc", { timeZone: source }));
      const offset = (local.getTime() / 1000 / 60) * -1;
      return offset;
    }
    // default
    return undefined;
  }

  static offsetToString(offset: number) {
    const o = Math.abs(offset);
    const hour = ("00" + Math.floor(o / 60)).slice(-2);
    const minute = ("00" + (o % 60)).slice(-2);
    const result = (offset > 0 ? "-" : "+") + hour + ":" + minute;
    return result;
  }

  /**
   * hh:mm to second
   */
  static hmToSec(hm: string) {
    if (!hm.match(/^\d?\d:\d?\d$/)) return undefined;
    const [h, m] = hm.split(":");
    const hour = parseInt(h);
    const minu = parseInt(m);
    if (hour < 0 || 23 < hour) return undefined;
    if (minu < 0 || 59 < minu) return undefined;
    return hour * 60 * 60 + minu * 60;
  }

  /**
   * hh:mm:ss to second
   */
  static hmsToSec(hms: string) {
    if (!hms.match(/^\d?\d:\d?\d:\d?\d$/)) return undefined!;
    const [h, m, s] = hms.split(":");
    const hour = parseInt(h);
    const min = parseInt(m);
    const sec = parseInt(s);
    if (hour < 0 && 23 < hour) return undefined!;
    if (min < 0 && 59 < min) return undefined!;
    if (sec < 0 && 59 < sec) return undefined!;
    return hour * 60 * 60 + min * 60 + sec;
  }

  static gap: number = 0;
  static setClock(clock: Source | undefined = undefined) {
    if (clock === undefined) {
      this.gap = 0;
      return;
    }
    this.gap = new Datetime(clock).time - new Datetime().time;
  }
}

// Datetime.test();
