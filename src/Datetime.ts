import { timingSafeEqual } from "crypto";

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
  const ms = Math.round((mod * 1000) % 1000);
  return { days: da, hours: ho, minutes: mi, seconds: se, milliseconds: ms };
};

// could not support Date
type Source = string | number | Datetime | Shift | undefined | null;

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
  constructor(source?: Source, timezone: string | undefined = undefined) {
    // save timezone
    this.tz = timezone ?? "utc";

    // If source is null or undefined, initialize with the current date and time.
    if (source === null || source === undefined) {
      this.dt = new Date(new Date().getTime() - this.offsetMS + Datetime.gap);
      return;
    }

    // If the source is a numeric type, initialize as unixtime in milliseconds.
    else if (typeof source === "number") {
      this.dt = new Date(source - this.offsetMS);
      return;
    }

    // If the source is a string, initialize it as a string in ISO8601 notation.
    if (typeof source === "string") {
      let tz: string;

      // If offset are omitted
      const offset = Datetime.stringToOffset(source);
      if (offset === undefined) {
        const off = Datetime.stringToOffset(timezone);
        let os: number;
        if (off === undefined) {
          os = 0;
          tz = "UTC";
        } else {
          os = off;
          tz = timezone!;
        }
        source += Datetime.offsetToString(os); // important
      }
      // Offset are specified
      else {
        const off = Datetime.stringToOffset(timezone);
        if (off === undefined) {
          tz = Datetime.offsetToString(offset);
        }
        // Timezone are specified.
        else if (offset !== off) {
          tz = timezone!;
        } else {
          tz = timezone!;
        }
      }
      this.tz = tz;
      this.dt = new Date(new Date(source).getTime() - this.offsetMS);
      return;
    }

    // If source is a Datetime object, initialize with it.
    if (source instanceof Datetime) {
      this.tz = source.tz;
      this.dt = new Date(source.dt);
      if (timezone) {
        const datetime = this.toTimezone(timezone);
        this.dt = datetime.dt;
        this.tz = datetime.tz;
      }
      return;
    }

    // If source is a Shift object, initialize with shifted current time.
    if (isShift(source)) {
      this.dt = new Datetime(undefined, this.tz).shift(source).dt;
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
    const src = (Datetime.stringToOffset(this.tz) ?? 0) * 60 * 1000;
    // const dst = (Datetime.stringToOffset(timezone) ?? 0) * 60 * 1000;
    return new Datetime(this.dt.getTime() + src, timezone);
  }

  shift(shift: Shift) {
    const shiftMS = toSecond(shift) * 1000;
    return new Datetime(this.time + shiftMS, this.tz);
  }

  get time() {
    return this.dt.getTime() + this.offsetMS;
  }
  get unixtime() {
    return Math.floor(this.time / 1000);
  }
  get year() {
    return this.dt.getUTCFullYear();
  }
  get month() {
    return this.dt.getUTCMonth();
  }
  get day() {
    return this.dt.getUTCDate();
  }
  get hours() {
    return this.dt.getUTCHours();
  }
  get minutes() {
    return this.dt.getUTCMinutes();
  }
  get seconds() {
    return this.dt.getUTCSeconds();
  }
  get milliseconds() {
    return this.dt.getUTCMilliseconds();
  }
  get timezone() {
    return this.tz;
  }
  get date() {
    return new Date(this.dt.getTime() + this.offsetMS);
  }
  // return offset minutes
  get offset() {
    return Datetime.stringToOffset(this.tz);
  }
  get offsetString() {
    return Datetime.offsetToString(Datetime.stringToOffset(this.tz)!);
  }
  get iso8601x() {
    return this.format("y-m-dTh:i:sz");
  }

  // private
  private get offsetMS() {
    return this.offset! * 60 * 1000;
  }
  private get tzoMS() {
    return new Date().getTimezoneOffset() * 60 * 1000;
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
      this.year,
      this.month + 1,
      this.day,
      this.hours,
      this.minutes,
      this.seconds,
      this.milliseconds,
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
    const m = source.match(/^.*([-+])(\d?\d):(\d?\d).*/);
    if (m) {
      const hour = parseInt(m[2]);
      const minute = parseInt(m[3]);
      return (hour * 60 + minute) * (m[1] === "-" ? 1 : -1) || 0; // NG:-0
    }
    // utc
    if (source.match(/(UTC|GMT)/i) || source.match(/z$/i)) {
      return 0;
    }
    // timezone notation
    if (source.match(/^[A-Za-z]+\/[A-Za-z]+/)) {
      const jaJP = new Date(0).toLocaleString("ja-JP", { timeZone: source });
      const [date, time] = jaJP.split(" ");
      const y = parseInt(date.split("/")[0]);
      const [h, m] = time.split(":").map((v) => parseInt(v));
      const diff = -(h * 60 + m);
      return y < 1970 ? 24 * 60 + diff : diff;
    }
    // could not detect
    return undefined; // utc;
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
    this.gap = new Datetime(clock).time - new Date().getTime();
  }
  static resetClock() {
    this.gap = 0;
  }
}

// Datetime.test();
