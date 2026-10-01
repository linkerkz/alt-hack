// Нормативный график сети: линии, по которым поезда ходят с постоянным
// интервалом в обе стороны. Маршрут — подряд идущие станции по участкам сети.
// Номера по правилу КТЖ: туда — нечётные, обратно — чётные; за сутки номер
// растёт на 2 с каждым рейсом, поэтому интервал делит сутки нацело.

export type Line = {
  kind: "passenger" | "freight";
  // Первый номер рейса туда; обратно — следующий чётный.
  number: number;
  // Интервал между рейсами и сдвиг первого рейса от полуночи, минуты.
  everyMinutes: number;
  offsetMinutes: number;
  route: string[];
};

export const LINES: Line[] = [
  {
    kind: "passenger",
    number: 1,
    everyMinutes: 480,
    offsetMinutes: 40,
    route: [
      "semey",
      "zhangiz-tobe",
      "ayagoz",
      "aktogay",
      "ushtobe",
      "sary-ozek",
      "almaty-1",
    ],
  },
  {
    kind: "passenger",
    number: 11,
    everyMinutes: 360,
    offsetMinutes: 95,
    route: [
      "almaty-1",
      "shu",
      "taraz",
      "shymkent",
      "arys",
      "turkestan",
      "kyzylorda",
      "kazaly",
      "saksaulskaya",
      "shalkar",
      "kandyagash",
      "aktobe",
    ],
  },
  {
    kind: "passenger",
    number: 31,
    everyMinutes: 480,
    offsetMinutes: 200,
    route: ["astana", "karaganda", "zharyk", "moyynty", "shu", "almaty-1"],
  },
  {
    kind: "passenger",
    number: 41,
    everyMinutes: 720,
    offsetMinutes: 310,
    route: ["petropavl", "kokshetau", "astana"],
  },
  {
    kind: "passenger",
    number: 51,
    everyMinutes: 720,
    offsetMinutes: 130,
    route: ["astana", "esil", "tobol", "kostanay"],
  },
  {
    kind: "passenger",
    number: 61,
    everyMinutes: 720,
    offsetMinutes: 420,
    route: ["astana", "ekibastuz", "pavlodar"],
  },
  {
    kind: "passenger",
    number: 71,
    everyMinutes: 720,
    offsetMinutes: 260,
    route: ["atyrau", "makat", "kandyagash", "aktobe"],
  },
  {
    kind: "passenger",
    number: 81,
    everyMinutes: 1440,
    offsetMinutes: 600,
    route: ["mangyshlak", "beyneu", "makat", "atyrau"],
  },
  // Транзит Китай — Европа через Достык.
  {
    kind: "freight",
    number: 2001,
    everyMinutes: 120,
    offsetMinutes: 15,
    route: ["dostyk", "aktogay", "moyynty", "zharyk", "karaganda", "astana"],
  },
  // Экспорт в Узбекистан через Сарыагаш.
  {
    kind: "freight",
    number: 2101,
    everyMinutes: 180,
    offsetMinutes: 70,
    route: [
      "altynkol",
      "almaty-1",
      "shu",
      "taraz",
      "shymkent",
      "arys",
      "saryagash",
    ],
  },
  {
    kind: "freight",
    number: 2201,
    everyMinutes: 240,
    offsetMinutes: 140,
    route: ["dostyk", "aktogay", "ushtobe", "sary-ozek", "almaty-1"],
  },
  // Экибастузский уголь в Россию.
  {
    kind: "freight",
    number: 2301,
    everyMinutes: 180,
    offsetMinutes: 50,
    route: ["ekibastuz", "astana", "kokshetau", "petropavl"],
  },
  {
    kind: "freight",
    number: 2401,
    everyMinutes: 240,
    offsetMinutes: 190,
    route: ["mangyshlak", "beyneu", "makat", "kandyagash", "aktobe"],
  },
  // Руда Жезказгана на Караганду.
  {
    kind: "freight",
    number: 2501,
    everyMinutes: 360,
    offsetMinutes: 110,
    route: ["zhezkazgan", "zharyk", "karaganda"],
  },
  // Зерно Костаная.
  {
    kind: "freight",
    number: 2601,
    everyMinutes: 360,
    offsetMinutes: 230,
    route: ["kostanay", "tobol", "esil", "astana"],
  },
  {
    kind: "freight",
    number: 2701,
    everyMinutes: 360,
    offsetMinutes: 300,
    route: ["semey", "zhangiz-tobe", "ayagoz", "aktogay", "dostyk"],
  },
  {
    kind: "freight",
    number: 2801,
    everyMinutes: 720,
    offsetMinutes: 380,
    route: ["balkhash", "moyynty", "shu"],
  },
];
