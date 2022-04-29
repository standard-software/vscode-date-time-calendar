const vscode = require(`vscode`);
const {
  _dateToString,
  _Year,
  _Month,
  _Day,
} = require(`./parts/parts.js`);

const {
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
} = require(`./lib/lib.js`);

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

  const mark = vscode.workspace.getConfiguration(`DateTimeCalendar`).get(`subMenuMark`);

  const registerCommand = (commandName, func) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        commandName, func
      )
    );
  };

  let select2WeeklyCalendarWeekType;
  let select3WeeklyCalendarPeriod;

  let select2MonthlyCalendarWeekType;
  let select3MonthlyCalendarPeriod;

  registerCommand(`DateTimeCalendar.SelectFunction`, () => { commandQuickPick([
    [`Date Format : Today Now`,                            `${mark}`, () => {
      commandQuickPick([
        [`Date Today`,                       `${mark}`, () => {
          selectFormatDate(
            `DateFormat`,
            _Day(`today`),
            `Date Time Calendar | Date Format | Date Today`
          );
        }],
        [`DateTime Today Now`,               `${mark}`, () => {
          selectFormatDate(
            `DateTimeFormat`,
            new Date(),
            `Date Time Calendar | Date Format | DateTime Today Now`
          );
        }],
        [`Time Now`,                         `${mark}`, () => {
          selectFormatDate(
            `TimeFormat`,
            new Date(),
            `Date Time Calendar | Date Format | Time Now`
          );
        }],
      ], `Date Time Calendar | Date Format : Today Now`);
    }],

    [`Date Format : Select Date`,             `${mark}`, () => { selectDateRange200Year(`SelectFormatDate`); }],

    // [`Calendar : Today`,                            `${mark}`, () => {
    //   commandQuickPick([
    //     [`Weekly Calendar`,                        `${mark}`, () => {
    //       commandQuickPick([
    //         [`Week Sun..Sat`,                      `${mark}`, () => { select2WeeklyCalendarWeekType(`Sun`); }],
    //         [`Week Mon..Sun`,                      `${mark}`, () => { select2WeeklyCalendarWeekType(`Mon`); }],
    //       ], `Date Time Calendar | Calendar : Today | Weekly`);
    //     }],
    //     [`Monthly Calendar`,                       `${mark}`, () => {
    //       commandQuickPick([
    //         [`Week Sun..Sat`,                      `${mark}`, () => { select2MonthlyCalendarWeekType(`Sun..Sat`, `Sun`); }],
    //         [`Week Mon..Sun`,                      `${mark}`, () => { select2MonthlyCalendarWeekType(`Mon..Sun`, `Mon`); }],
    //       ], `Date Time Calendar | Calendar : Today | Monthly`);
    //     }],
    //   ], `Date Time Calendar | Calendar : Today`);
    // }],
    [`Calendar : This month today`,                       `${mark}`, () => {
      commandQuickPick([
        [`Line Vertical Calendar`,                        `${mark}`, () => {
          selectWeeklyCalendar(
            getDateArrayWeeklyMonth(_Day(`today`), `Sun`), _Day(`today`), _Day(`today`),
            `Date Time Calendar | Calendar : This month today | Line Vertical`,
          );
        }],
        [`Monthly Square Calendar`,                       `${mark}`, () => {
          selectMonthlyCalendar(
            [_Day(`today`)],
            true, `Sun`,
            `Date Time Calendar | Calendar : This month today | Monthly Square`
          );
        }],
      ], `Date Time Calendar | Calendar : This month today`);
    }],

    [`Calendar : Select Date`,             `${mark}`, () => { selectDateRange200Year(`SelectDateCalendar`); }],

  ], `Date Time Calendar | Select Function`); });

  const selectDateRange200Year = (mode) => {
    if (![`SelectFormatDate`, `SelectDateCalendar`].includes(mode)) {
      throw new Error(`selectDateRange200Year mode:${mode}`);
    }

    const dateThisYear = _Year(`this`);
    const yearThis =  dateThisYear.getFullYear();
    const yearBefore100 = yearThis - 100;
    const yearBefore10 = yearThis - 10;
    const yearBefore1 = yearThis - 1;
    const yearAfter1 = yearThis + 1;
    const yearAfter10 = yearThis + 10;
    const yearAfter100 = yearThis + 100;

    const placeHolder = `Date Time Calendar | Date Format | Select Date`;
    commandQuickPick([
      [
        `${yearBefore100} - ${yearBefore10 - 1} : 100 year before`, `${mark}`,
        () => { selectTenYear(_Year(-100, dateThisYear)); }
      ],
      [
        `${yearBefore10} - ${yearBefore1} : 10 year before`, `${mark}`,
        () => { selectOneYear(_Year(-10, dateThisYear)); }
      ],
      [
        `${yearThis} : This year`, `${mark}`,
        () => { selectMonth(dateThisYear); }
      ],
      [
        `${yearAfter1} - ${yearAfter10} : 10 year after`, `${mark}`,
        () => { selectOneYear(_Year(1, dateThisYear)); }
      ],
      [
        `${yearAfter10 + 1} - ${yearAfter100} : 100 year after`, `${mark}`,
        () => { selectTenYear(_Year(11, dateThisYear)); }
      ],
    ], placeHolder);

    const selectTenYear = (dateYear) => {
      const commands = [];
      for (let i = 0; i <= 8; i += 1) {
        const targetDate = _Year(i * 10, dateYear);
        commands.push([
          `${_dateToString(targetDate, `YYYY`)} - ${_dateToString(_Year(9, targetDate), `YYYY`)}`,
          `${mark}`,
          () => { selectOneYear(targetDate); },
        ]);
      }
      commandQuickPick(commands, `${placeHolder} | ` +
        `${_dateToString(dateYear, `YYYY`)} - ${_dateToString(_Year(89, dateYear), `YYYY`)}`);
    };

    const selectOneYear = (dateYear) => {
      const commands = [];
      for (let i = 0; i <= 9; i += 1) {
        const targetDate = _Year(i, dateYear);
        commands.push([
          _dateToString(targetDate, `YYYY`),
          `${mark}`,
          () => { selectMonth(targetDate); },
        ]);
      }
      commandQuickPick(commands, `${placeHolder} | ` +
        `${_dateToString(dateYear, `YYYY`)} - ${_dateToString(_Year(9, dateYear), `YYYY`)}`);
    };

    const selectMonth = (dateYear) => {
      const commands = [];
      for (let i = 1; i <= 12; i += 1) {
        const targetDate = _Month(i - 1, dateYear);
        const isThisMonth = equalMonth(targetDate, _Month(`this`));
        commands.push([
          dateToStringJp(targetDate, `MM : YYYY-MM : MMM`) +
          (isThisMonth ? ` : This month` : ``),
          `${mark}`,
          () => { selectDay(targetDate); },
        ]);
      }
      commandQuickPick(commands, `${placeHolder} | ${dateYear.getFullYear()}`);
    };

    const selectDay = (dateMonth) => {
      const commands = [];
      const monthDaysCount = monthDayCount(dateMonth);
      for (let i = 1; i <= monthDaysCount; i += 1) {
        const targetDate = _Day(i - 1, dateMonth);
        const isYesterday = equalDate(targetDate, _Day(-1));
        const isToday = equalToday(targetDate);
        const isTomorrow = equalDate(targetDate, _Day(1));
        commands.push([
          _dateToString(targetDate, `DD : YYYY-MM-DD ddd`) +
          (isYesterday ? ` : Yesterday`
            : isToday ? ` : Today`
              : isTomorrow ? ` : Tomorrow`
                : ``),
          `${mark}`,
          () => {
            if (mode === `SelectFormatDate`) {
              selectFormatDate(
                `DateFormat`,
                targetDate,
                `${placeHolder} | ${_dateToString(targetDate, `YYYY-MM-DD ddd`)}`
              );
            } else if (mode === `SelectDateCalendar`) {
              commandQuickPick([
                [`Line Vertical Calendar`,                        `${mark}`, () => {
                  selectWeeklyCalendar(
                    getDateArrayWeeklyMonth(targetDate, `Sun`), targetDate, targetDate,
                    `Date Time Calendar | Calendar : This month today | Line Vertical`,
                  );
                }],
                [`Monthly Square Calendar`,                       `${mark}`, () => {
                  selectMonthlyCalendar(
                    [targetDate],
                    true, `Sun`,
                    `Date Time Calendar | Calendar : This month today | Monthly Square`
                  );
                }],
              ], `Date Time Calendar | Calendar : This month today`);
            }
          }
        ]);
      }
      commandQuickPick(commands, `${placeHolder} | ${_dateToString(dateMonth, `YYYY-MM`)}`);
    };

  };

  const selectFormatDate = (formatName, targetDate, placeHolder) => {
    if (!([`DateFormat`, `DateTimeFormat`, `TimeFormat`].includes(formatName))) {
      throw new Error(`selectFormatDate formatName`);
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

  const insertString = (str) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage(`No editor is active`);
      return;
    }

    const selections = editor.selections;
    editor.edit(editBuilder => {
      for (const selection of selections) {
        editBuilder.replace(selection, ``);
        editBuilder.insert(selection.active, str);
      }
    });
  };

  const insertFormatDate = (date, format) => {
    insertString(dateToStringJp(date, format));
  };

  // select2WeeklyCalendarWeekType = (startDayOfWeek) => {
  //   const weekRange = weekRangeDayTitle(startDayOfWeek);
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Week ${weekRange}`;
  //   commandQuickPick([
  //     [`This Week [Today]`, `${mark}`,
  //       () => {
  //         selectWeeklyCalendar(
  //           getDateArrayInWeek(_Day(`today`), startDayOfWeek),
  //           true, `${placeHolder} | This Week [Today]`
  //         );
  //       }
  //     ],
  //     [`Select Week`,   `${mark}`,
  //       () => { select3WeeklyCalendarPeriod(startDayOfWeek); }
  //     ],
  //   ], placeHolder);
  // };

  // select3WeeklyCalendarPeriod = (startDayOfWeek) => {
  //   const weekRange = weekRangeDayTitle(startDayOfWeek);
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Week ${weekRange} | Select Week`;
  //   const createCommand = (title, dates, optionToday) => [
  //     title, `${mark}`, () => {
  //       selectWeeklyCalendar(
  //         dates,
  //         optionToday,
  //         `${placeHolder} | ${title}`
  //       );
  //     },
  //   ];
  //   commandQuickPick([
  //     createCommand(`Last Week`,
  //       getDateArrayInWeek(_Day(-7), startDayOfWeek), false
  //     ),
  //     createCommand(`This Week`,
  //       getDateArrayInWeek(_Day(`today`), startDayOfWeek), false
  //     ),
  //     createCommand(`Next Week`,
  //       getDateArrayInWeek(_Day( 7), startDayOfWeek), false
  //     ),
  //     createCommand(`Last To Next 3Weeks [Today]`,
  //       getDateArrayWeekly3Week(_Day(`today`), startDayOfWeek), true
  //     ),
  //     createCommand(`This Month [Today]`,
  //       getDateArrayWeeklyMonth(_Day(`today`), startDayOfWeek), true
  //     ),
  //     createCommand(`Last To Next 3Months [Today]`,
  //       getDateArrayWeekly3Months(_Day(`today`), startDayOfWeek), true
  //     ),
  //     createCommand(`This Year [Today]`,
  //       getDateArrayWeeklyYear(_Day(`today`), startDayOfWeek), true
  //     ),
  //     createCommand(`Last To Next 3Years [Today]`,
  //       getDateArrayWeekly3Years(_Day(`today`), startDayOfWeek), true
  //     ),
  //   ], placeHolder);
  // };

  const selectWeeklyCalendar = (targetDates, titleDate, pickupDate, placeHolder) => {
    commandQuickPick(
      getWeeklyCalendarSettings().map(
        setting => [
          dateToStringJp(titleDate, setting.title),
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
                pickupDate,
                headerFormat: setting.header,
                todayFormat: setting.today,
                lineFormat: setting.line,
              }
            );

            insertString(weeklyCalendarText);
          }
        ]
      ),
      placeHolder
    );
  };

  select2MonthlyCalendarWeekType = (weekRangeDayTitle, startDayOfWeek) => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Week ${weekRangeDayTitle}`;
    commandQuickPick([
      [`This Month [Today]`, `${mark}`,
        () => {
          selectMonthlyCalendar(
            [_Day(`today`)],
            true, startDayOfWeek,
            `${placeHolder} | This Month [Today]`
          );
        }
      ],
      [`Select Month`,   `${mark}`,
        () => { select3MonthlyCalendarPeriod(weekRangeDayTitle, startDayOfWeek); }
      ],
    ], placeHolder);
  };

  select3MonthlyCalendarPeriod = (weekRangeDayTitle, startDayOfWeek) => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Week ${weekRangeDayTitle} | Select Month`;
    const createCommand = (title, dates, optionToday) => [
      title, `${mark}`, () => {
        selectMonthlyCalendar(
          dates,
          optionToday,
          startDayOfWeek,
          `${placeHolder} | ${title}`
        );
      },
    ];
    commandQuickPick([
      createCommand(`Last Month`,
        [_Month(-1, _Day(`today`))], false
      ),
      createCommand(`This Month`,
        [_Day(`today`)], false
      ),
      createCommand(`Next Month`,
        [_Month(1, _Day(`today`))], false
      ),
      createCommand(`Last To Next 3Month [Today]`,
        getDateArrayMonthly3Months(_Day(`today`)), true
      ),
      createCommand(`This Year [Today]`,
        getDateArrayMonthlyYear(_Day(`today`)), true
      ),
      createCommand(`Last To Next 3Years [Today]`,
        getDateArrayMonthly3Years(_Day(`today`)), true
      ),
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

            insertString(monthlyCalendarText);
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

  registerCommand(`DateTimeCalendar.DateFormatSelectDate`, () => {
    selectDateRange200Year();
  });

  // registerCommand(`DateTimeCalendar.WeeklyCalendarSunSatThisWeekTodaySelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Sun..Sat | This Week [Today] | Select`;
  //   selectWeeklyCalendar(getDateArrayInWeek(_Day(`today`), `Sun`), true, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarSunSatLastWeekSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Sun..Sat | Last Week | Select`;
  //   selectWeeklyCalendar(getDateArrayInWeek(_Day(-7), `Sun`), false, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarSunSatThisWeekSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Sun..Sat | This Week | Select`;
  //   selectWeeklyCalendar(getDateArrayInWeek(_Day(`today`), `Sun`), false, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarSunSatNextWeekSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Sun..Sat | Next Week | Select`;
  //   selectWeeklyCalendar(getDateArrayInWeek(_Day( 7), `Sun`), false, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarSunSatLastToNextWeekSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Sun..Sat | Last To Next 3Weeks [Today] | Select`;
  //   selectWeeklyCalendar(getDateArrayWeekly3Week(_Day(`today`), `Sun`), true, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarSunSatThisMonthSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Sun..Sat | This Month [Today] | Select`;
  //   selectWeeklyCalendar(getDateArrayWeeklyMonth(_Day(`today`), `Sun`), true, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarSunSatLastToNextMonthSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Sun..Sat | Last To Next 3Month [Today] | Select`;
  //   selectWeeklyCalendar(getDateArrayWeekly3Months(_Day(`today`), `Sun`), true, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarSunSatThisYearSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Sun..Sat | This Year [Today] | Select`;
  //   selectWeeklyCalendar(getDateArrayWeeklyYear(_Day(`today`), `Sun`), true, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarSunSatLastToNextYearSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Sun..Sat | Last To Next 3Year [Today] | Select`;
  //   selectWeeklyCalendar(getDateArrayWeekly3Years(_Day(`today`), `Sun`), true, placeHolder);
  // });

  // registerCommand(`DateTimeCalendar.WeeklyCalendarMonSunThisWeekTodaySelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Mon..Sun | This Week [Today] | Select`;
  //   selectWeeklyCalendar(getDateArrayInWeek(_Day(`today`), `Mon`), true, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarMonSunLastWeekSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Mon..Sun | Last Week | Select`;
  //   selectWeeklyCalendar(getDateArrayInWeek(_Day(-7), `Mon`), false, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarMonSunThisWeekSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Mon..Sun | This Week | Select`;
  //   selectWeeklyCalendar(getDateArrayInWeek(_Day(`today`), `Mon`), false, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarMonSunNextWeekSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Mon..Sun | Next Week | Select`;
  //   selectWeeklyCalendar(getDateArrayInWeek(_Day( 7), `Mon`), false, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarMonSunLastToNextWeekSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Mon..Sun | Last To Next 3Weeks [Today] | Select`;
  //   selectWeeklyCalendar(getDateArrayWeekly3Week(_Day(`today`), `Mon`), true, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarMonSunThisMonthSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Mon..Sun | This Month [Today] | Select`;
  //   selectWeeklyCalendar(getDateArrayWeeklyMonth(_Day(`today`), `Mon`), true, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarMonSunLastToNextMonthSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Mon..Sun | Last To Next 3Month [Today] | Select`;
  //   selectWeeklyCalendar(getDateArrayWeekly3Months(_Day(`today`), `Mon`), true, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarMonSunThisYearSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Mon..Sun | This Year [Today] | Select`;
  //   selectWeeklyCalendar(getDateArrayWeeklyYear(_Day(`today`), `Mon`), true, placeHolder);
  // });
  // registerCommand(`DateTimeCalendar.WeeklyCalendarMonSunLastToNextYearSelect`, () => {
  //   const placeHolder = `Date Time Calendar | Weekly Calendar | Mon..Sun | Last To Next 3Year [Today] | Select`;
  //   selectWeeklyCalendar(getDateArrayWeekly3Years(_Day(`today`), `Mon`), true, placeHolder);
  // });

  registerCommand(`DateTimeCalendar.MonthlyCalendarSunSatThisMonthTodaySelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Sun..Sat | This Month [Today] | Select`;
    selectMonthlyCalendar([_Day(`today`)], true, `Sun`, placeHolder);
  });
  registerCommand(`DateTimeCalendar.MonthlyCalendarSunSatLastMonthSelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Sun..Sat | Last Month | Select`;
    selectMonthlyCalendar([_Month(-1, _Day(`today`))], false, `Sun`, placeHolder);
  });
  registerCommand(`DateTimeCalendar.MonthlyCalendarSunSatThisMonthSelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Sun..Sat | This Month | Select`;
    selectMonthlyCalendar([_Day(`today`)], false, `Sun`, placeHolder);
  });
  registerCommand(`DateTimeCalendar.MonthlyCalendarSunSatNextMonthSelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Sun..Sat | Next Month | Select`;
    selectMonthlyCalendar([_Month(1, _Day(`today`))], false, `Sun`, placeHolder);
  });
  registerCommand(`DateTimeCalendar.MonthlyCalendarSunSatLastToNextMonthSelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Sun..Sat | Last To Next 3Month | Select`;
    selectMonthlyCalendar(getDateArrayMonthly3Months(_Day(`today`)), true, `Sun`, placeHolder);
  });
  registerCommand(`DateTimeCalendar.MonthlyCalendarSunSatThisYearSelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Sun..Sat | This Year | Select`;
    selectMonthlyCalendar(getDateArrayMonthlyYear(_Day(`today`)), true, `Sun`, placeHolder);
  });
  registerCommand(`DateTimeCalendar.MonthlyCalendarSunSatLastToNextYearSelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Sun..Sat | Last To Next 3Year | Select`;
    selectMonthlyCalendar(getDateArrayMonthly3Years(_Day(`today`)), true, `Sun`, placeHolder);
  });

  registerCommand(`DateTimeCalendar.MonthlyCalendarMonSunThisMonthTodaySelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Mon..Sun | This Month [Today] | Select`;
    selectMonthlyCalendar([_Day(`today`)], true, `Mon`, placeHolder);
  });
  registerCommand(`DateTimeCalendar.MonthlyCalendarMonSunLastMonthSelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Mon..Sun | Last Month | Select`;
    selectMonthlyCalendar([_Month(-1, _Day(`today`))], false, `Mon`, placeHolder);
  });
  registerCommand(`DateTimeCalendar.MonthlyCalendarMonSunThisMonthSelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Mon..Sun | This Month | Select`;
    selectMonthlyCalendar([_Day(`today`)], false, `Mon`, placeHolder);
  });
  registerCommand(`DateTimeCalendar.MonthlyCalendarMonSunNextMonthSelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Mon..Sun | Next Month | Select`;
    selectMonthlyCalendar([_Month(1, _Day(`today`))], false, `Mon`, placeHolder);
  });
  registerCommand(`DateTimeCalendar.MonthlyCalendarMonSunLastToNextMonthSelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Mon..Sun | Last To Next 3Month | Select`;
    selectMonthlyCalendar(getDateArrayMonthly3Months(_Day(`today`)), true, `Mon`, placeHolder);
  });
  registerCommand(`DateTimeCalendar.MonthlyCalendarMonSunThisYearSelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Mon..Sun | This Year | Select`;
    selectMonthlyCalendar(getDateArrayMonthlyYear(_Day(`today`)), true, `Mon`, placeHolder);
  });
  registerCommand(`DateTimeCalendar.MonthlyCalendarMonSunLastToNextYearSelect`, () => {
    const placeHolder = `Date Time Calendar | Monthly Calendar | Mon..Sun | Last To Next 3Year | Select`;
    selectMonthlyCalendar(getDateArrayMonthly3Years(_Day(`today`)), true, `Mon`, placeHolder);
  });

}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
