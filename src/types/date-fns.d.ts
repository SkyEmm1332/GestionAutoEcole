declare module 'date-fns/locale' {
  interface Locale {
    code: string;
    formatDistance: (token: string, count: number, options: any) => string;
    formatRelative: (token: string, date: Date, baseDate: Date, options: any) => string;
    localize: {
      ordinalNumber: (n: number, options: any) => string;
      era: (n: number, options: any) => string;
      quarter: (n: number, options: any) => string;
      month: (n: number, options: any) => string;
      day: (n: number, options: any) => string;
      dayPeriod: (n: number, options: any) => string;
    };
    formatLong: {
      date: (options: any) => string;
      time: (options: any) => string;
      dateTime: (options: any) => string;
    };
    match: {
      ordinalNumber: (str: string) => RegExpMatchArray | null;
      era: (str: string) => RegExpMatchArray | null;
      quarter: (str: string) => RegExpMatchArray | null;
      month: (str: string) => RegExpMatchArray | null;
      day: (str: string) => RegExpMatchArray | null;
      dayPeriod: (str: string) => RegExpMatchArray | null;
    };
    options: {
      weekStartsOn: number;
      firstWeekContainsDate: number;
    };
  }
  export const fr: Locale;
} 