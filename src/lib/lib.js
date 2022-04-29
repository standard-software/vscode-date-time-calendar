const {
  _dateToString,
  _dayOfWeek, _nameOfMonth,
  _Year,
  _Month,
  _Day,
  _Datetime,
  _getDatetime,
  _unique,
  _subFirst, _subLast,
  _paddingFirst, _paddingLast,
} = require(`../parts/parts.js`);

const dayOfWeekEn2 = (date, timezoneOffset) => {
  return _subFirst(_dayOfWeek.names.EnglishShort()[
    _dateToString.rule.dayOfWeek(date, timezoneOffset)
  ], 2);
};

const dayOfWeekJpShort = (date, timezoneOffset) => {
  return _dayOfWeek.names.JapaneseShort()[
    _dateToString.rule.dayOfWeek(date, timezoneOffset)
  ];
};

const dayOfWeekJpLong = (date, timezoneOffset) => {
  return _dayOfWeek.names.JapaneseLong()[
    _dateToString.rule.dayOfWeek(date, timezoneOffset)
  ];
};

const am_pmJp = (date, timezoneOffset) => {
  return _dateToString.rule.hours(date, timezoneOffset) < 12 ? `午前` : `午後`;
};

const date2Space = (date, timezoneOffset) => {
  return _paddingFirst(_dateToString.rule.date1(date, timezoneOffset), 2, ` `);
};

const month2Space = (date, timezoneOffset) => {
  return _paddingFirst(_dateToString.rule.month1(date, timezoneOffset), 2, ` `);
};

const monthEnLongLeft = (date, timezoneOffset) => {
  return _paddingLast(_nameOfMonth.names.EnglishLong()[
    _dateToString.rule.month(date, timezoneOffset)
  ], 9, ` `);
};

const monthEnLongRight = (date, timezoneOffset) => {
  return _paddingFirst(_nameOfMonth.names.EnglishLong()[
    _dateToString.rule.month(date, timezoneOffset)
  ], 9, ` `);
};

const dateToStringJp = (date, format) => {
  const rule = _dateToString.rule.Default();
  rule[`dd`] = { func: dayOfWeekEn2 };
  rule[`SD`] = { func: date2Space };
  rule[`SM`] = { func: month2Space };
  rule[`LMMMMM`] = { func: monthEnLongLeft };
  rule[`RMMMMM`] = { func: monthEnLongRight };
  rule[`DDD`] = { func: dayOfWeekJpShort };
  rule[`DDDD`] = { func: dayOfWeekJpLong };
  rule[`AAA`] = { func: am_pmJp };
  return _dateToString(
    date, format, undefined, rule,
  );
};

const getBeforeDate = (sourceDate, func) => {
  let date = _Day(-1, sourceDate);
  while (true) {
    if (func(date)) {
      return date;
    }
    date = _Day(-1, date);
  }
};

const getBeforeDayOfWeek = (sourceDate, dayOfWeek) => {
  return getBeforeDate(_Day(1, sourceDate), (date) => {
    return date.getDay() === dayOfWeek;
  });
};

const getDateArrayInWeek = (sourceDate, startDayOfWeek) => {
  if (![`Sun`, `Mon`].includes(startDayOfWeek)) {
    throw new Error(`getDateArrayInWeek startDayOfWeek`);
  }
  const result = [];
  const startDate = getBeforeDayOfWeek(
    sourceDate, _dayOfWeek.names.EnglishShort().indexOf(startDayOfWeek)
  );
  result.push(startDate);
  result.push(_Day(1, startDate));
  result.push(_Day(2, startDate));
  result.push(_Day(3, startDate));
  result.push(_Day(4, startDate));
  result.push(_Day(5, startDate));
  result.push(_Day(6, startDate));
  return result;
};

const getDateArrayInMonth = (sourceDate) => {
  const result = [];
  const startDate = _Month(`this`, sourceDate);
  const endDate = _Day(-1, _Month(`next`, sourceDate));
  const {date: dayCount} = _getDatetime(endDate);
  for (let i = 0; i < dayCount; i += 1) {
    result.push(_Day(i, startDate));
  }
  return result;
};

const getDateArrayInYear = (sourceDate) => {
  const result = [];
  const startDate = _Year(`this`, sourceDate);
  const endDate = _Day(-1, _Year(`next`, sourceDate));
  const dayCount = (endDate - startDate) / (1000 * 60 * 60 * 24);
  if (!Number.isInteger(dayCount)) {
    throw new Error(`getDateArrayInYear dayCount:${dayCount}`);
  }
  for (let i = 0; i <= dayCount; i += 1) {
    result.push(_Day(i, startDate));
  }
  return result;
};

const getDateArrayWeekly3Week = (sourceDate, startDayOfWeek) => {
  return [
    ...getDateArrayInWeek(_Day(-7, sourceDate), startDayOfWeek),
    ...getDateArrayInWeek(_Day( 0, sourceDate), startDayOfWeek),
    ...getDateArrayInWeek(_Day( 7, sourceDate), startDayOfWeek),
  ];
};

const getDateArrayWeeklyMonth = (sourceDate, startDayOfWeek) => {
  const dateStart = _Month(`this`, sourceDate);
  const dateEnd = _Day(-1, _Month(`next`, dateStart));
  return _unique(
    [
      ...getDateArrayInWeek(dateStart, startDayOfWeek),
      ...getDateArrayInMonth(dateStart),
      ...getDateArrayInWeek(dateEnd, startDayOfWeek),
    ],
    v => v.getTime()
  );
};

const getDateArrayWeekly3Months = (sourceDate, startDayOfWeek) => {
  const dateStart = _Month(`last`, sourceDate);
  const dateEnd = _Day(-1, _Month(3, dateStart));
  return _unique(
    [
      ...getDateArrayInWeek(dateStart, startDayOfWeek),
      ...getDateArrayInMonth(dateStart),
      ...getDateArrayInMonth(sourceDate),
      ...getDateArrayInMonth(dateEnd),
      ...getDateArrayInWeek(dateEnd, startDayOfWeek),
    ],
    v => v.getTime()
  );
};

const getDateArrayWeeklyYear = (sourceDate, startDayOfWeek) => {
  const dateStart = _Year(`this`, sourceDate);
  const dateEnd = _Day(-1, _Year(1, dateStart));
  return _unique(
    [
      ...getDateArrayInWeek(dateStart, startDayOfWeek),
      ...getDateArrayInYear(sourceDate),
      ...getDateArrayInWeek(dateEnd, startDayOfWeek),
    ],
    v => v.getTime()
  );
};

const getDateArrayWeekly3Years = (sourceDate, startDayOfWeek) => {
  const dateStart = _Year(`last`, sourceDate);
  const dateEnd = _Day(-1, _Year(3, dateStart));
  return _unique(
    [
      ...getDateArrayInWeek(dateStart, startDayOfWeek),
      ...getDateArrayInYear(dateStart),
      ...getDateArrayInYear(sourceDate),
      ...getDateArrayInYear(dateEnd),
      ...getDateArrayInWeek(dateEnd, startDayOfWeek),
    ],
    v => v.getTime()
  );
};

const getDateArrayMonthly3Months = (sourceDate) => {
  return [
    _Month(-1, sourceDate),
    sourceDate,
    _Month(1, sourceDate)
  ];
};

const getDateArrayMonthlyYear = (sourceDate) => {
  const startDate = _Year(`this`, sourceDate);
  return [
    startDate,
    _Month( 1, startDate),
    _Month( 2, startDate),
    _Month( 3, startDate),
    _Month( 4, startDate),
    _Month( 5, startDate),
    _Month( 6, startDate),
    _Month( 7, startDate),
    _Month( 8, startDate),
    _Month( 9, startDate),
    _Month(10, startDate),
    _Month(11, startDate),
  ];
};

const getDateArrayMonthly3Years = (sourceDate) => {
  const startDate = _Year(-1, sourceDate);
  return [
    startDate,
    _Month( 1, startDate),
    _Month( 2, startDate),
    _Month( 3, startDate),
    _Month( 4, startDate),
    _Month( 5, startDate),
    _Month( 6, startDate),
    _Month( 7, startDate),
    _Month( 8, startDate),
    _Month( 9, startDate),
    _Month(10, startDate),
    _Month(11, startDate),
    _Month(12, startDate),
    _Month(13, startDate),
    _Month(14, startDate),
    _Month(15, startDate),
    _Month(16, startDate),
    _Month(17, startDate),
    _Month(18, startDate),
    _Month(19, startDate),
    _Month(20, startDate),
    _Month(21, startDate),
    _Month(22, startDate),
    _Month(23, startDate),
    _Month(24, startDate),
    _Month(25, startDate),
    _Month(26, startDate),
    _Month(27, startDate),
    _Month(28, startDate),
    _Month(29, startDate),
    _Month(30, startDate),
    _Month(31, startDate),
    _Month(32, startDate),
    _Month(33, startDate),
    _Month(34, startDate),
    _Month(35, startDate),
  ];
};

const equalDatetime = (sourceDate, targetDate, compareItems) => {
  if (!compareItems.every(
    i => [
      `year`, `month`, `date`, `hours`, `minutes`, `seconds`, `milliseconds`
    ].includes(i)
  )) {
    throw new Error(`equalDate compareItems:${compareItems}`);
  }
  const source = _getDatetime(sourceDate);
  const target = _getDatetime(targetDate);
  return compareItems.every(i => source[i] === target[i]);
};


const equalMonth = (sourceDate, baseDate) => {
  return equalDatetime(sourceDate, baseDate, [`year`, `month`]);
};

const equalDate = (sourceDate, baseDate) => {
  return equalDatetime(sourceDate, baseDate, [`year`, `month`, `date`]);
};

const equalToday = (sourceDate) => {
  return equalDate(sourceDate, new Date());
};

const getEndDayOfWeek = (startDayOfWeek) => {
  if (startDayOfWeek === `Sun`) {
    return `Sat`;
  } else if (startDayOfWeek === `Mon`) {
    return `Sun`;
  } else {
    throw new Error(`getEndDayOfWeek startDayOfWeek`);
  }
};

const monthDayCount = (date) => {
  const {year, month } = _getDatetime(date);
  const target = _Datetime(year, month + 1, 1);
  return _getDatetime(_Day(-1, target)).date;
};

const weekRangeDayTitle = (startDayOfWeek) =>
  `${startDayOfWeek}..${getEndDayOfWeek(startDayOfWeek)}`;

const textCalendarWeekly = (targetDates,{
  pickupDate,
  headerFormat,
  todayFormat,
  lineFormat,
}) => {
  let result = ``;
  let headerBuffer = ``;
  for (const date of targetDates) {
    const header = dateToStringJp(date, headerFormat);
    if (headerBuffer !== header) {
      result += `${header}\n`;
    }
    headerBuffer = header;
    if (pickupDate && equalDate(date, pickupDate)) {
      result += dateToStringJp(date, todayFormat);
    } else {
      result += dateToStringJp(date, lineFormat);
    }
    result += `\n`;
  }
  return result;
};

const textCalendarMonthly = (targetDate,{
  startDayOfWeek,
  pickupDate,
  headerFormat,
  dayOfWeekFormat,
  dateFormat,
  indent,
  space,
  todayLeft,
  todayRight,
  otherMonthDate,
}) => {
  if (![`Sun`, `Mon`].includes(startDayOfWeek)) {
    throw new Error(`textCalendarMonthly startDayOfWeek`);
  }
  const dayOfWeekEnShort = _dayOfWeek.names.EnglishShort();
  const weekEndDayOfWeek = getEndDayOfWeek(startDayOfWeek);

  const dateMonthStart = _Month(`this`, targetDate);
  const dateMonthEnd = _Day(-1, _Month(1, targetDate));

  let result = `${dateToStringJp(dateMonthStart, headerFormat)}\n`;
  const weekDates = getDateArrayInWeek(dateMonthStart, startDayOfWeek);
  const calendarDates = _unique(
    [
      ...weekDates,
      ...getDateArrayInMonth(targetDate),
      ...getDateArrayInWeek(dateMonthEnd, startDayOfWeek),
    ],
    v => v.getTime()
  );

  result += indent;
  for (const date of weekDates) {
    const dayOfWeek = dateToStringJp(date, dayOfWeekFormat);
    if (weekDates.indexOf(date) === weekDates.length - 1) {
      result += dayOfWeek;
    } else {
      result += dayOfWeek + _subLast(space, space.length - (dayOfWeek.length - 2));
    }
  }
  result += `\n`;

  let todayFlag = false;
  for (const date of calendarDates) {
    if (pickupDate && equalDate(date, pickupDate)) {
      if (dayOfWeekEnShort[date.getDay()] === startDayOfWeek) {
        result +=
          _subFirst(indent, indent.length - todayLeft.length) +
          todayLeft +
          dateToStringJp(date, dateFormat) +
          todayRight;
      } else {
        result +=
          _subFirst(space, space.length - todayLeft.length) +
          todayLeft +
          dateToStringJp(date, dateFormat) +
          todayRight;
      }
      todayFlag = true;
    } else if (!otherMonthDate && !equalMonth(date, targetDate)) {
      if (dayOfWeekEnShort[date.getDay()] === startDayOfWeek) {
        result += indent + `  `;
      } else {
        result +=
          (!todayFlag ? space
            : _subLast(space, space.length - todayRight.length)) +
            `  `;
      }
      todayFlag = false;
    } else {
      if (dayOfWeekEnShort[date.getDay()] === startDayOfWeek) {
        result += indent + dateToStringJp(date, dateFormat);
      } else {
        result +=
          (!todayFlag ? space
            : _subLast(space, space.length - todayRight.length)) +
            dateToStringJp(date, dateFormat);
      }
      todayFlag = false;
    }
    if (dayOfWeekEnShort[date.getDay()] === weekEndDayOfWeek) {
      result += `\n`;
    }
  }
  return result;
};

module.exports = {
  equalMonth,
  equalDate,
  equalToday,
  monthDayCount,
  dateToStringJp,
  weekRangeDayTitle,
  getDateArrayInWeek,
  getDateArrayWeekly3Week,
  getDateArrayWeeklyMonth,
  getDateArrayWeekly3Months,
  getDateArrayWeeklyYear,
  getDateArrayWeekly3Years,
  textCalendarWeekly,
  getDateArrayMonthly3Months,
  getDateArrayMonthlyYear,
  getDateArrayMonthly3Years,
  textCalendarMonthly,
};
