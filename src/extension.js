const vscode = require(`vscode`);
const {
  _dateToString,
  _dayOfWeek, _nameOfMonth,
  _Year,
  _Month,
  _Day,
  _getDatetime,
  _unique,
  _subFirst, _subLast,
  _paddingFirst, _paddingLast,
} = require(`./parts/parts.js`);

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

const equalToday = (sourceDate) => {
  return equalDatetime(sourceDate, new Date(), [`year`, `month`, `date`]);
};

const equalMonth = (sourceDate, baseDate) => {
  return equalDatetime(sourceDate, baseDate, [`year`, `month`]);
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

const weekRangeDayTitle = (startDayOfWeek) =>
  `${startDayOfWeek}..${getEndDayOfWeek(startDayOfWeek)}`;

const textCalendarWeekly = (targetDates,{
  todayPickup,
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
    if (todayPickup && equalToday(date)) {
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
  todayPickup,
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
    if (todayPickup && equalToday(date)) {
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

const commandQuickPick = (commandsArray, placeHolder) => {
  const commands = commandsArray.map(c => ({label:c[0], description:c[1], func:c[2]}));
  vscode.window.showQuickPick(
    commands.map(({label, description}) => ({label, description})),
    {
      canPickMany: false,
      placeHolder
    }
  ).then((item) => {
    if (!item) { return; }
    commands.find(({label}) => label === item.label).func();
  });
};

const getDateFormatArray = (formatName) => {
  if (!([`DateFormat`, `DateTimeFormat`, `TimeFormat`].includes(formatName))) {
    throw new Error(`getFormatArray formatName`);
  }
  const formatData = vscode.workspace.getConfiguration(`DateTimeCalendar`).get(formatName);
  return formatData.map(item => item.format);
};

const getDefaultFormat = (formatName) => {
  return getDateFormatArray(formatName)[0];
};

const getWeeklyCalendarSettings = () =>{
  return vscode.workspace.getConfiguration(`DateTimeCalendar`).get(`WeeklyCalendar`);
};

const getMonthlyCalendarSettings = () =>{
  return vscode.workspace.getConfiguration(`DateTimeCalendar`).get(`MonthlyCalendar`);
};

function activate(context) {

  const registerCommand = (commandName, func) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        commandName, func
      )
    );
  };

  let select1DateFormat;
  let select2DateFormatTodayNow;
  let select2DateFormatSelectDate;
  let select3DateFormatSelectDateInWeek;

  let select1WeeklyCalendar;
  let select2WeeklyCalendarWeekType;
  let select3WeeklyCalendarPeriod;

  let select1MonthlyCalendar;
  let select2MonthlyCalendarWeekType;
  let select3MonthlyCalendarPeriod;

  registerCommand(`DateTimeCalendar.SelectFunction`, () => {
    commandQuickPick([
      [`Date Format`,         ``, () => { select1DateFormat(); }],
      [`Weekly Calendar`,       ``, () => { select1WeeklyCalendar(); }],
      [`Month Calendar`,        ``, () => { select1MonthlyCalendar(); }],
    ], `Date Time Calendar | Select Function`);
  });

  select1DateFormat = () => {
    commandQuickPick([
      [`Today Now`,     ``, () => { select2DateFormatTodayNow(); }],
      [`Select Date`,   ``, () => { select2DateFormatSelectDate(); }],
    ], `Date Time Calendar | Date Format`);
  };

  select2DateFormatTodayNow = () => {
    const placeHolder = `Date Time Calendar | Date Format | Today Now`;
    const createCommand = (title, formatType, date) => [
      title,
      ``,
      () => { selectFormatDate(`${formatType}Format`, date, `${placeHolder} | ${title}`); }
    ];
    commandQuickPick([
      createCommand(`Date Today`,         `Date`,     _Day(`today`)),
      createCommand(`DateTime Today Now`, `DateTime`, new Date()),
      createCommand(`Time Now`,           `Time`,     new Date()),
    ], placeHolder);
  };

  select2DateFormatSelectDate = () => {
    const placeHolder = `Date Time Calendar | Date Format | Select Date`;
    const createCommand1 = (title, date) => [
      title, ``,
      () => { selectFormatDate(`DateFormat`, date, `${placeHolder} | ${title}`); }
    ];
    const createCommand2 = (title, startDayOfWeek) => [
      title, ``,
      () => { select3DateFormatSelectDateInWeek(startDayOfWeek, `${placeHolder} | ${title}`); }
    ];
    commandQuickPick([
      createCommand1(`Date Yesterday`, _Day(`yesterday`)),
      createCommand1(`Date Tomorrow`,  _Day(`tomorrow`)),
      createCommand2(`Week ${weekRangeDayTitle(`Sun`)}`, `Sun`),
      createCommand2(`Week ${weekRangeDayTitle(`Mon`)}`, `Mon`),
    ], placeHolder);
  };

  select3DateFormatSelectDateInWeek = (startDayOfWeek, placeHolder) => {
    const createCommand = (title, date) => [
      `${title} ${dateToStringJp(date, `ddd MM/DD`)}`,
      ``,
      () => { selectFormatDate(`DateFormat`, date, `${placeHolder} | ${title}`); }
    ];

    const daysLastWeek = getDateArrayInWeek(_Day(-7), startDayOfWeek);
    const daysThisWeek = getDateArrayInWeek(_Day( 0), startDayOfWeek);
    const daysNextWeek = getDateArrayInWeek(_Day( 7), startDayOfWeek);

    commandQuickPick([
      createCommand(`LastWeek`, daysLastWeek[0]),
      createCommand(`LastWeek`, daysLastWeek[1]),
      createCommand(`LastWeek`, daysLastWeek[2]),
      createCommand(`LastWeek`, daysLastWeek[3]),
      createCommand(`LastWeek`, daysLastWeek[4]),
      createCommand(`LastWeek`, daysLastWeek[5]),
      createCommand(`LastWeek`, daysLastWeek[6]),

      createCommand(`ThisWeek`, daysThisWeek[0]),
      createCommand(`ThisWeek`, daysThisWeek[1]),
      createCommand(`ThisWeek`, daysThisWeek[2]),
      createCommand(`ThisWeek`, daysThisWeek[3]),
      createCommand(`ThisWeek`, daysThisWeek[4]),
      createCommand(`ThisWeek`, daysThisWeek[5]),
      createCommand(`ThisWeek`, daysThisWeek[6]),

      createCommand(`NextWeek`, daysNextWeek[0]),
      createCommand(`NextWeek`, daysNextWeek[1]),
      createCommand(`NextWeek`, daysNextWeek[2]),
      createCommand(`NextWeek`, daysNextWeek[3]),
      createCommand(`NextWeek`, daysNextWeek[4]),
      createCommand(`NextWeek`, daysNextWeek[5]),
      createCommand(`NextWeek`, daysNextWeek[6]),

    ], placeHolder);
  };

  const selectFormatDate = (formatName, targetDate, placeHolder) => {
    if (!([`DateFormat`, `DateTimeFormat`, `TimeFormat`].includes(formatName))) {
      throw new Error(`selectFormat formatName`);
    }

    commandQuickPick(
      getDateFormatArray(formatName).map(
        format => [
          dateToStringJp(targetDate, format),
          ``,
          () => insertFormatDate(targetDate, format)
        ]
      ),
      placeHolder
    );
  };

  const insertFormatDate = (date, format) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage(`No editor is active`);
      return;
    }

    editor.edit(editBuilder => {
      for (const selection of editor.selections) {
        editBuilder.replace(selection, ``);
        editBuilder.insert(selection.active, dateToStringJp(date, format));
      }
    });
  };

  select1WeeklyCalendar = () => {
    const placeHolder = `Date Time Calendar | Weekly Calendar`;
    commandQuickPick([
      [`Week Sun..Sat`,  ``, () => { select2WeeklyCalendarWeekType(`Sun`); }],
      [`Week Mon..Sun`,  ``, () => { select2WeeklyCalendarWeekType(`Mon`); }],
    ], placeHolder);
  };

  select2WeeklyCalendarWeekType = (startDayOfWeek) => {
    const weekRange = weekRangeDayTitle(startDayOfWeek);
    const placeHolder = `Date Time Calendar | Weekly Calendar | Week ${weekRange}`;
    commandQuickPick([
      [`This Week [Today]`, ``,
        () => {
          selectWeeklyCalendar(
            getDateArrayInWeek(_Day(`today`), startDayOfWeek),
            true, `${placeHolder} | This Week [Today]`
          );
        }
      ],
      [`Select Week`,   ``,
        () => { select3WeeklyCalendarPeriod(startDayOfWeek); }
      ],
    ], placeHolder);
  };

  select3WeeklyCalendarPeriod = (startDayOfWeek) => {
    const weekRange = weekRangeDayTitle(startDayOfWeek);
    const placeHolder = `Date Time Calendar | Weekly Calendar | Week ${weekRange} | Select Week`;
    const createCommand = (title, dates, optionToday) => [
      title, ``, () => {
        selectWeeklyCalendar(
          dates,
          optionToday,
          `${placeHolder} | ${title}`
        );
      },
    ];
    commandQuickPick([
      createCommand(`Last Week`,
        getDateArrayInWeek(_Day(-7), startDayOfWeek), false
      ),
      createCommand(`This Week`,
        getDateArrayInWeek(_Day(`today`), startDayOfWeek), false
      ),
      createCommand(`Next Week`,
        getDateArrayInWeek(_Day( 7), startDayOfWeek), false
      ),
      createCommand(`Last To Next 3Weeks [Today]`,
        getDateArrayWeekly3Week(_Day(`today`), startDayOfWeek), true
      ),
      createCommand(`This Month [Today]`,
        getDateArrayWeeklyMonth(_Day(`today`), startDayOfWeek), true
      ),
      createCommand(`Last To Next 3Months [Today]`,
        getDateArrayWeekly3Months(_Day(`today`), startDayOfWeek), true
      ),
      createCommand(`This Year [Today]`,
        getDateArrayWeeklyYear(_Day(`today`), startDayOfWeek), true
      ),
      createCommand(`Last To Next 3Years [Today]`,
        getDateArrayWeekly3Years(_Day(`today`), startDayOfWeek), true
      ),
    ], placeHolder);
  };

  const selectWeeklyCalendar = (targetDates, optionToday, placeHolder) => {
    commandQuickPick(
      getWeeklyCalendarSettings().map(
        setting => [
          dateToStringJp(targetDates[0], setting.title),
          ``,
          () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
              vscode.window.showInformationMessage(`No editor is active`);
              return;
            }

            const weeklyCalendarText = textCalendarWeekly(
              targetDates,
              {
                todayPickup: optionToday,
                headerFormat: setting.header,
                todayFormat: setting.today,
                lineFormat: setting.line,
              }
            );

            editor.edit(editBuilder => {
              const selection = editor.selections[0];
              editBuilder.replace(selection, ``);
              editBuilder.insert(selection.active, weeklyCalendarText);
            });
          }
        ]
      ),
      placeHolder
    );
  };

  select1MonthlyCalendar = () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar`;
    commandQuickPick([
      [`Week Sun..Sat`,  ``, () => { select2MonthlyCalendarWeekType(`Sun..Sat`, `Sun`); }],
      [`Week Mon..Sun`,  ``, () => { select2MonthlyCalendarWeekType(`Mon..Sun`, `Mon`); }],
    ], placeHolder);
  };

  select2MonthlyCalendarWeekType = (weekRangeDayTitle, startDayOfWeek) => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Week ${weekRangeDayTitle}`;
    commandQuickPick([
      [`This Month [Today]`, ``,
        () => {
          selectMonthlyCalendar(
            [_Day(`today`)],
            true, startDayOfWeek,
            `${placeHolder} | This Month [Today]`
          );
        }
      ],
      [`Select Month`,   ``,
        () => { select3MonthlyCalendarPeriod(weekRangeDayTitle, startDayOfWeek); }
      ],
    ], placeHolder);
  };

  select3MonthlyCalendarPeriod = (weekRangeDayTitle, startDayOfWeek) => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Week ${weekRangeDayTitle} | Select Month`;
    const createCommand = (title, dates, optionToday) => [
      title, ``, () => {
        selectMonthlyCalendar(
          dates,
          optionToday,
          startDayOfWeek,
          `${placeHolder} | ${title}`
        );
      },
    ];
    const monthInYear = () => {
      const startDate = _Year(`this`, _Day(`today`));
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
    const monthIn3Years = () => {
      const startDate = _Year(-1, _Day(`today`));
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
    commandQuickPick([
      createCommand(`Last Month`, [
        _Month(-1, _Day(`today`))
      ], false),
      createCommand(`This Month`,[
        _Day(`today`)
      ], false),
      createCommand(`Next Month`,[
        _Month(1, _Day(`today`))
      ], false),
      createCommand(`Last To Next 3Month [Today]`,[
        _Month(-1, _Day(`today`)),
        _Day(`today`),
        _Month(1, _Day(`today`))
      ], true),
      createCommand(`This Year [Today]`,
        monthInYear(),
        true),
      createCommand(`Last To Next 3Years [Today]`,
        monthIn3Years(),
        true),
    ], placeHolder);
  };

  const selectMonthlyCalendar = (targetDates, optionToday, startDayOfWeek, placeHolder) => {
    commandQuickPick(
      getMonthlyCalendarSettings().map(
        setting => [
          dateToStringJp(_Month(`this`, targetDates[0]), setting.title),
          ``,
          () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
              vscode.window.showInformationMessage(`No editor is active`);
              return;
            }

            let monthlyCalendarText = ``;
            for (const targetDate of targetDates) {
              monthlyCalendarText += textCalendarMonthly(
                targetDate,
                {
                  startDayOfWeek,
                  todayPickup: optionToday,
                  headerFormat: setting.header,
                  dayOfWeekFormat: setting.dayOfWeek,
                  dateFormat: setting.date,
                  indent: setting.indent,
                  space: setting.space,
                  todayLeft: setting.todayLeft,
                  todayRight: setting.todayRight,
                  otherMonthDate: setting.otherMonthDate,
                }
              );
            }

            editor.edit(editBuilder => {
              const selection = editor.selections[0];
              editBuilder.replace(selection, ``);
              editBuilder.insert(selection.active, monthlyCalendarText);
            });
          }
        ]
      ),
      placeHolder
    );
  };

  registerCommand(`DateTimeCalendar.DateFormatDateTodayDefault`, () => {
    insertFormatDate(new Date(), getDefaultFormat(`DateFormat`));
  });
  registerCommand(`DateTimeCalendar.DateFormatDateTimeNowDefault`, () => {
    insertFormatDate(new Date(), getDefaultFormat(`DateTimeFormat`));
  });
  registerCommand(`DateTimeCalendar.DateFormatTimeNowDefault`, () => {
    insertFormatDate(new Date(), getDefaultFormat(`TimeFormat`));
  });

  registerCommand(`DateTimeCalendar.DateFormatDateTodaySelect`, () => {
    const placeHolder = `Date Time Calendar | Date Format | Date Today | Select`;
    selectFormatDate(`DateFormat`, new Date(), placeHolder);
  });
  registerCommand(`DateTimeCalendar.DateFormatDateTimeNowSelect`, () => {
    const placeHolder = `Date Time Calendar | Date Format | DateTime Today Now | Select`;
    selectFormatDate(`DateTimeFormat`, new Date(), placeHolder);
  });
  registerCommand(`DateTimeCalendar.DateFormatTimeNowSelect`, () => {
    const placeHolder = `Date Time Calendar | Date Format | Time Now | Select`;
    selectFormatDate(`TimeFormat`, new Date(), placeHolder);
  });

  registerCommand(`DateTimeCalendar.DateFormatDateYesterdayDefault`, () => {
    insertFormatDate(_Day(`yesterday`), getDefaultFormat(`DateFormat`));
  });
  registerCommand(`DateTimeCalendar.DateFormatDateTomorrowDefault`, () => {
    insertFormatDate(_Day(`tomorrow`), getDefaultFormat(`DateFormat`));
  });

  registerCommand(`DateTimeCalendar.DateFormatDateYesterdaySelect`, () => {
    const placeHolder = `Date Time Calendar | Date Format | Date Yesterday | Select`;
    selectFormatDate(`DateFormat`, _Day(`yesterday`), placeHolder);
  });
  registerCommand(`DateTimeCalendar.DateFormatDateTomorrowSelect`, () => {
    const placeHolder = `Date Time Calendar | Date Format | Date Tomorrow | Select`;
    selectFormatDate(`DateFormat`, _Day(`tomorrow`), placeHolder);
  });
  registerCommand(`DateTimeCalendar.DateFormatSunSatWeekDaySelect`, () => {
    const placeHolder = `Date Time Calendar | Date Format | Sun..Sat Last To Next Week | Select`;
    select3DateFormatSelectDateInWeek(`Sun`, placeHolder);
  });
  registerCommand(`DateTimeCalendar.DateFormatMonSunWeekDaySelect`, () => {
    const placeHolder = `Date Time Calendar | Date Format | Mon..Sun Last To Next Week | Select`;
    select3DateFormatSelectDateInWeek(`Mon`, placeHolder);
  });

  registerCommand(`DateTimeCalendar.WeeklyCalenderSunSatThisWeekTodaySelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Sun..Sat | This Week [Today] | Select`;
    selectWeeklyCalendar(getDateArrayInWeek(_Day(`today`), `Sun`), true, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderSunSatLastWeekSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Sun..Sat | Last Week | Select`;
    selectWeeklyCalendar(getDateArrayInWeek(_Day(-7), `Sun`), false, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderSunSatThisWeekSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Sun..Sat | This Week | Select`;
    selectWeeklyCalendar(getDateArrayInWeek(_Day(`today`), `Sun`), false, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderSunSatNextWeekSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Sun..Sat | Next Week | Select`;
    selectWeeklyCalendar(getDateArrayInWeek(_Day( 7), `Sun`), false, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderSunSatLastToNextWeekSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Sun..Sat | Last To Next 3Weeks [Today] | Select`;
    selectWeeklyCalendar(getDateArrayWeekly3Week(_Day(`today`), `Sun`), true, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderSunSatThisMonthSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Sun..Sat | This Month [Today] | Select`;
    selectWeeklyCalendar(getDateArrayWeeklyMonth(_Day(`today`), `Sun`), true, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderSunSatLastToNextMonthSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Sun..Sat | Last To Next 3Month [Today] | Select`;
    selectWeeklyCalendar(getDateArrayWeekly3Months(_Day(`today`), `Sun`), true, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderSunSatThisYearSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Sun..Sat | This Year [Today] | Select`;
    selectWeeklyCalendar(getDateArrayWeeklyYear(_Day(`today`), `Sun`), true, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderSunSatLastToNextYearSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Sun..Sat | Last To Next 3Year [Today] | Select`;
    selectWeeklyCalendar(getDateArrayWeekly3Years(_Day(`today`), `Sun`), true, placeHolder);
  });

  registerCommand(`DateTimeCalendar.WeeklyCalenderMonSunThisWeekTodaySelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Mon..Sun | This Week [Today] | Select`;
    selectWeeklyCalendar(getDateArrayInWeek(_Day(`today`), `Mon`), true, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderMonSunLastWeekSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Mon..Sun | Last Week | Select`;
    selectWeeklyCalendar(getDateArrayInWeek(_Day(-7), `Mon`), false, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderMonSunThisWeekSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Mon..Sun | This Week | Select`;
    selectWeeklyCalendar(getDateArrayInWeek(_Day(`today`), `Mon`), false, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderMonSunNextWeekSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Mon..Sun | Next Week | Select`;
    selectWeeklyCalendar(getDateArrayInWeek(_Day( 7), `Mon`), false, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderMonSunLastToNextWeekSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Mon..Sun | Last To Next 3Weeks [Today] | Select`;
    selectWeeklyCalendar(getDateArrayWeekly3Week(_Day(`today`), `Mon`), true, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderMonSunThisMonthSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Mon..Sun | This Month [Today] | Select`;
    selectWeeklyCalendar(getDateArrayWeeklyMonth(_Day(`today`), `Mon`), true, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderMonSunLastToNextMonthSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Mon..Sun | Last To Next 3Month [Today] | Select`;
    selectWeeklyCalendar(getDateArrayWeekly3Months(_Day(`today`), `Mon`), true, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderMonSunThisYearSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Mon..Sun | This Year [Today] | Select`;
    selectWeeklyCalendar(getDateArrayWeeklyYear(_Day(`today`), `Mon`), true, placeHolder);
  });
  registerCommand(`DateTimeCalendar.WeeklyCalenderMonSunLastToNextYearSelect`, () => {
    const placeHolder = `Date Time Calendar | Weekly Calender | Mon..Sun | Last To Next 3Year [Today] | Select`;
    selectWeeklyCalendar(getDateArrayWeekly3Years(_Day(`today`), `Mon`), true, placeHolder);
  });

}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
