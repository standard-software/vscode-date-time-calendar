const vscode = require(`vscode`);
const {
  _dateToString,
  _dayOfWeek,
  _Year,
  _Month,
  _Day,
  _getDatetime,
  _unique,
} = require(`./parts/parts.js`);

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

const dateToStringJp = (date, format) => {
  const rule = _dateToString.rule.Default();
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
  if (![`sun`, `mon`].includes(startDayOfWeek.toLowerCase())) {
    throw new Error(`getDateArrayInMonth startDayOfWeek`);
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

const equalDateToday = (sourceDate) => {
  return equalDatetime(sourceDate, new Date(), [`year`, `month`, `date`]);
};

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
    if (todayPickup && equalDateToday(date)) {
      result += dateToStringJp(date, todayFormat);
    } else {
      result += dateToStringJp(date, lineFormat);
    }
    result += `\n`;
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
  const formatData = vscode.workspace.getConfiguration(`DateTime`).get(formatName);
  return formatData.map(item => item.format);
};

const getDefaultFormat = (formatName) => {
  return getDateFormatArray(formatName)[0];
};

const getWeeklyCalendarSettings = () =>{
  return vscode.workspace.getConfiguration(`DateTime`).get(`WeeklyCalendar`);
};

function activate(context) {

  const registerCommand = (commandName, func) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        commandName, func
      )
    );
  };

  registerCommand(`DateTime.SelectFunction`, () => {

    let select1InsertFormat;
    let select1WeeklyCalendar;
    commandQuickPick([
      [`Insert Format`,         ``, () => { select1InsertFormat(); }],
      [`Weekly Calendar`,       ``, () => { select1WeeklyCalendar(); }],
      [`Month Calendar`,        ``, () => {  }],
    ], `DateTime | Select Function`);

    select1InsertFormat = () => {
      let select2TodayNow;
      let select2SelectDate;
      commandQuickPick([
        [`Today Now`,     ``, () => { select2TodayNow(); }],
        [`Select Date`,   ``, () => { select2SelectDate(); }],
      ], `DateTime | Insert Format`);

      select2TodayNow = () => {
        const placeHolder = `DateTime | Insert Format | Today Now`;
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

      select2SelectDate = () => {
        let select3Week;
        const placeHolder = `DateTime | Insert Format | Select Date`;
        const createCommand = (title, formatType, date) => [
          title,
          ``,
          () => { selectFormatDate(`${formatType}Format`, date, `${placeHolder} | ${title}`); }
        ];
        commandQuickPick([
          createCommand(`Date Yesterday`, `Date`, _Day(`yesterday`)),
          createCommand(`Date Tomorrow`,  `Date`, _Day(`tomorrow`)),
          [`Week Sun..Sat`,  ``, () => { select3Week(`Sun..Sat`, `Sun`); }],
          [`Week Mon..Sun`,  ``, () => { select3Week(`Mon..Sun`, `Mon`); }],
        ], placeHolder);

        select3Week = (weekRangeDayTitle, startDayOfWeek) => {
          let select4DayOfWeek;
          commandQuickPick([
            [`Last Week`, ``, () => { select4DayOfWeek(`Last`, -7, startDayOfWeek); }],
            [`This Week`, ``, () => { select4DayOfWeek(`This`,  0, startDayOfWeek); }],
            [`Next Week`, ``, () => { select4DayOfWeek(`Next`,  7, startDayOfWeek); }],
          ], `DateTime | Insert Format | Select Date | Week ${weekRangeDayTitle}`);

          select4DayOfWeek = (weekType, dateAdd, startDayOfWeek) => {
            const placeHolder = `DateTime | Insert Format | Select Date | Week ${weekRangeDayTitle} | ${weekType} Week`;
            const createCommand = (title, formatType, date) => [
              title,
              ``,
              () => { selectFormatDate(`${formatType}Format`, date, `${placeHolder} | ${title}`); }
            ];
            const days = getDateArrayInWeek(_Day(dateAdd), startDayOfWeek);
            commandQuickPick([
              createCommand(dateToStringJp(days[0], `ddd MM/DD`), `Date`, days[0]),
              createCommand(dateToStringJp(days[1], `ddd MM/DD`), `Date`, days[1]),
              createCommand(dateToStringJp(days[2], `ddd MM/DD`), `Date`, days[2]),
              createCommand(dateToStringJp(days[3], `ddd MM/DD`), `Date`, days[3]),
              createCommand(dateToStringJp(days[4], `ddd MM/DD`), `Date`, days[4]),
              createCommand(dateToStringJp(days[5], `ddd MM/DD`), `Date`, days[5]),
              createCommand(dateToStringJp(days[6], `ddd MM/DD`), `Date`, days[6]),
            ], placeHolder);
          };
        };

      };
    };

    select1WeeklyCalendar = () => {
      let select2WeekType;
      const placeHolder = `DateTime | Weekly Calendar`;
      commandQuickPick([
        [`Week Sun..Sat`,  ``, () => { select2WeekType(`Sun..Sat`, `Sun`); }],
        [`Week Mon..Sun`,  ``, () => { select2WeekType(`Mon..Sun`, `Mon`); }],
      ], placeHolder);

      select2WeekType = (weekRangeDayTitle, startDayOfWeek) => {
        let select3WeekPeriod;
        const placeHolder = `DateTime | Weekly Calendar | Week ${weekRangeDayTitle}`;
        commandQuickPick([
          [`This Week [Today]`, ``,
            () => {
              selectWeeklyCalendar(
                getDateArrayInWeek(_Day(`today`), startDayOfWeek),
                true, startDayOfWeek,
                `${placeHolder} | This Week [Today]`
              );
            }
          ],
          [`Select Week`,   ``,
            () => { select3WeekPeriod(weekRangeDayTitle, startDayOfWeek); }
          ],
        ], placeHolder);

        select3WeekPeriod = (weekRangeDayTitle, startDayOfWeek) => {
          const placeHolder = `DateTime | Weekly Calendar | Week ${weekRangeDayTitle} | Select Week`;
          commandQuickPick([
            [`Last Week`,           ``, () => {
              selectWeeklyCalendar(
                getDateArrayInWeek(_Day(-7), startDayOfWeek),
                false, `${placeHolder} | Last Week`
              );
            }],
            [`This Week`,           ``, () => {
              selectWeeklyCalendar(
                getDateArrayInWeek(_Day(`today`), startDayOfWeek),
                false, `${placeHolder} | This Week`
              );
            }],
            [`Next Week`,           ``, () => {
              selectWeeklyCalendar(
                getDateArrayInWeek(_Day(7), startDayOfWeek),
                false, `${placeHolder} | Next Week`
              );
            }],
            [`Last To This Weeks`,  ``, () => {
              selectWeeklyCalendar(
                [
                  ...getDateArrayInWeek(_Day(-7), startDayOfWeek),
                  ...getDateArrayInWeek(_Day( 0), startDayOfWeek),
                ],
                false, `${placeHolder} | Last To This Weeks`
              );
            }],
            [`This To Next Weeks`,  ``, () => {
              selectWeeklyCalendar(
                [
                  ...getDateArrayInWeek(_Day( 0), startDayOfWeek),
                  ...getDateArrayInWeek(_Day( 7), startDayOfWeek),
                ],
                false, `${placeHolder} | This To Next Weeks`
              );
            }],
            [`Last To Next 3Weeks`, ``, () => {
              selectWeeklyCalendar(
                [
                  ...getDateArrayInWeek(_Day(-7), startDayOfWeek),
                  ...getDateArrayInWeek(_Day( 0), startDayOfWeek),
                  ...getDateArrayInWeek(_Day( 7), startDayOfWeek),
                ],
                false, `${placeHolder} | Last To Next 3Weeks`
              );
            }],
            [`Last Month`,          ``, () => {
              const dateMonthStart = _Month(`last`, _Day(`today`));
              const dateMonthEnd = _Day(-1, _Month(`next`, dateMonthStart));
              selectWeeklyCalendar(
                _unique(
                  [
                    ...getDateArrayInWeek(dateMonthStart, startDayOfWeek),
                    ...getDateArrayInMonth(dateMonthStart),
                    ...getDateArrayInWeek(dateMonthEnd, startDayOfWeek),
                  ],
                  v => v.getTime()
                ),
                false, `${placeHolder} | Last Month`
              );
            }],
            [`This Month`,          ``, () => {
              const dateMonthStart = _Month(`this`, _Day(`today`));
              const dateMonthEnd = _Day(-1, _Month(`next`, dateMonthStart));
              selectWeeklyCalendar(
                _unique(
                  [
                    ...getDateArrayInWeek(dateMonthStart, startDayOfWeek),
                    ...getDateArrayInMonth(dateMonthStart),
                    ...getDateArrayInWeek(dateMonthEnd, startDayOfWeek),
                  ],
                  v => v.getTime()
                ),
                false, `${placeHolder} | This Month`
              );
            }],
            [`Next Month`,          ``, () => {
              const dateMonthStart = _Month(`next`, _Day(`today`));
              const dateMonthEnd = _Day(-1, _Month(`next`, dateMonthStart));
              selectWeeklyCalendar(
                _unique(
                  [
                    ...getDateArrayInWeek(dateMonthStart, startDayOfWeek),
                    ...getDateArrayInMonth(dateMonthStart),
                    ...getDateArrayInWeek(dateMonthEnd, startDayOfWeek),
                  ],
                  v => v.getTime()
                ),
                false, `${placeHolder} | Next Month`
              );
            }],
            [`Last To Next 3Months`, ``, () => {
              const dateMonthStart = _Month(`last`, _Day(`today`));
              const dateMonthEnd = _Day(-1, _Month(2, _Day(`today`)));
              selectWeeklyCalendar(
                _unique(
                  [
                    ...getDateArrayInWeek(dateMonthStart, startDayOfWeek),
                    ...getDateArrayInMonth(dateMonthStart),
                    ...getDateArrayInMonth(_Day(`today`)),
                    ...getDateArrayInMonth(dateMonthEnd),
                    ...getDateArrayInWeek(dateMonthEnd, startDayOfWeek),
                  ],
                  v => v.getTime()
                ),
                false, `${placeHolder} | Last To Next 3Months`
              );
            }],
            [`This Year`, ``, () => {
              const dateMonthStart = _Year(`this`, _Day(`today`));
              const dateMonthEnd = _Day(-1, _Year(1, _Day(`today`)));
              selectWeeklyCalendar(
                _unique(
                  [
                    ...getDateArrayInWeek(dateMonthStart, startDayOfWeek),
                    ...getDateArrayInYear(_Day(`today`)),
                    ...getDateArrayInWeek(dateMonthEnd, startDayOfWeek),
                  ],
                  v => v.getTime()
                ),
                false, `${placeHolder} | This Year`
              );
            }],
            [`Last To Next 3Years`, ``, () => {
              const dateMonthStart = _Year(`last`, _Day(`today`));
              const dateMonthEnd = _Day(-1, _Year(2, _Day(`today`)));
              selectWeeklyCalendar(
                _unique(
                  [
                    ...getDateArrayInWeek(dateMonthStart, startDayOfWeek),
                    ...getDateArrayInYear(dateMonthStart),
                    ...getDateArrayInYear(_Day(`today`)),
                    ...getDateArrayInYear(dateMonthEnd),
                    ...getDateArrayInWeek(dateMonthEnd, startDayOfWeek),
                  ],
                  v => v.getTime()
                ),
                false, `${placeHolder} | Last To Next 3Years`
              );
            }],
          ], placeHolder);
        };
      };

    };

  });

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

  const selectWeeklyCalendar = (targetDates, optionToday, placeHolder) => {
    commandQuickPick(
      getWeeklyCalendarSettings().map(
        setting => [
          setting.title,
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

  registerCommand(`DateTime.InsertDateTodayDefaultFormat`, () => {
    insertFormatDate(new Date(), getDefaultFormat(`DateFormat`));
  });
  registerCommand(`DateTime.InsertDateTimeNowDefaultFormat`, () => {
    insertFormatDate(new Date(), getDefaultFormat(`DateTimeFormat`));
  });
  registerCommand(`DateTime.InsertTimeNowDefaultFormat`, () => {
    insertFormatDate(new Date(), getDefaultFormat(`TimeFormat`));
  });

}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
