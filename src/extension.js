const vscode = require(`vscode`);
const {
  isUndefined,
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
  getDateArrayWeeklyMonth,
  textCalendarLineVertical,
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

const getLineVerticalCalendarSettings = () =>{
  const config = vscode.workspace.getConfiguration(`DateTimeCalendar`);
  let result = config.get(`WeeklyCalendar`);
  if (!isUndefined(result)) {
    config.update(`LineVerticalCalendar`, result, true);
    config.update(`WeeklyCalendar`, undefined, true);
  } else {
    result = config.get(`LineVerticalCalendar`);
  }
  return result;
};

const getMonthlySquareCalendarSettings = () =>{
  const config = vscode.workspace.getConfiguration(`DateTimeCalendar`);
  let result = config.get(`MonthlyCalendar`);
  if (!isUndefined(result)) {
    config.update(`MonthlySquareCalendar`, result, true);
    config.update(`MonthlyCalendar`, undefined, true);
  } else {
    result = config.get(`MonthlySquareCalendar`);
  }
  return result;
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

  registerCommand(`DateTimeCalendar.SelectFunction`, () => { commandQuickPick([
    [`Date Format : Today Now`, `${mark}`, () => {
      commandQuickPick([
        [`Date Today`,  `${mark}`, () => {
          selectFormatDate(
            `DateFormat`,
            _Day(`today`),
            `Date Time Calendar | Date Format | Date Today`
          );
        }],
        [`DateTime Today Now`,  `${mark}`, () => {
          selectFormatDate(
            `DateTimeFormat`,
            new Date(),
            `Date Time Calendar | Date Format | DateTime Today Now`
          );
        }],
        [`Time Now`,  `${mark}`, () => {
          selectFormatDate(
            `TimeFormat`,
            new Date(),
            `Date Time Calendar | Date Format | Time Now`
          );
        }],
      ], `Date Time Calendar | Date Format : Today Now`);
    }],

    [`Date Format : Select Date`, `${mark}`, () => {
      selectDateRange200Year(`SelectFormatDate`);
    }],

    [`Calendar : This month today`, `${mark}`, () => {
      const targetDate = _Day(`today`);
      selectCalendar(targetDate, targetDate,
        `Date Time Calendar | Calendar : This month today`
      );
    }],

    [`Calendar : Select Month`, `${mark}`, () => {
      selectDateRange200Year(`SelectMonthCalendar`);
    }],
    [`Calendar : Select Date`,  `${mark}`, () => {
      selectDateRange200Year(`SelectDateCalendar`);
    }],

  ], `Date Time Calendar | Select Function`); });

  const selectDateRange200Year = (mode) => {

    let placeHolder = ``;
    if (mode === `SelectFormatDate`) {
      placeHolder = `Date Time Calendar | Date Format : Select Date`;
    } else if (mode === `SelectDateCalendar`) {
      placeHolder = `Date Time Calendar | Calendar : Select Date`;
    } else if (mode === `SelectMonthCalendar`) {
      placeHolder = `Date Time Calendar | Calendar : Select Month`;
    } else {
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
          () => {
            if (mode === `SelectMonthCalendar`) {
              selectCalendar(targetDate, null,
                `${placeHolder} | ${_dateToString(targetDate, `YYYY-MM`)}`
              );
            } else {
              selectDay(targetDate);
            }
          },
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
              selectCalendar(targetDate, targetDate,
                `${placeHolder} | ${_dateToString(targetDate, `YYYY-MM-DD ddd`)}`
              );
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

  const selectCalendar = (targetDate, pickupDate, placeHolder) => {
    commandQuickPick([
      [`Line Vertical Calendar`,  `${mark}`, () => {
        selectLineVerticalCalendar(
          getDateArrayWeeklyMonth(targetDate, `Sun`), targetDate, pickupDate,
          `${placeHolder} | Line Vertical Calendar`,
        );
      }],
      [`Monthly Square Calendar`, `${mark}`, () => {
        selectMonthlyCalendar(
          [targetDate], targetDate, pickupDate,
          `${placeHolder} | Monthly Square Calendar`
        );
      }],
    ], `${placeHolder}`);
  };

  const selectLineVerticalCalendar = (targetDates, titleDate, pickupDate, placeHolder) => {
    commandQuickPick(
      getLineVerticalCalendarSettings().map(
        setting => [
          dateToStringJp(titleDate, setting.title),
          ``,
          () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
              vscode.window.showInformationMessage(`No editor is active`);
              return;
            }

            const calendarText = textCalendarLineVertical(
              targetDates,
              {
                pickupDate,
                headerFormat: setting.header,
                todayFormat: setting.today,
                lineFormat: setting.line,
              }
            );

            insertString(calendarText);
          }
        ]
      ),
      placeHolder
    );
  };

  const selectMonthlyCalendar = (targetDates, titleDate, pickupDate, placeHolder) => {
    commandQuickPick(
      getMonthlySquareCalendarSettings().map(
        setting => [
          dateToStringJp(_Month(`this`, titleDate), setting.title),
          ``,
          () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
              vscode.window.showInformationMessage(`No editor is active`);
              return;
            }

            const { startDayOfWeek = `Sun` } = setting;
            let calendarText = ``;
            for (const targetDate of targetDates) {
              calendarText += textCalendarMonthly(
                targetDate,
                {
                  startDayOfWeek,
                  pickupDate,
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

            insertString(calendarText);
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

  registerCommand(`DateTimeCalendar.LineVerticalCalendarThisMonthSelect`, () => {
    selectLineVerticalCalendar(
      getDateArrayWeeklyMonth(_Day(`today`), `Sun`), _Day(`today`), _Day(`today`),
      `Date Time Calendar | Line Vertical Calendar | This month today | Select`,
    );
  });
  registerCommand(`DateTimeCalendar.MonthlySquareCalendarThisMonthSelect`, () => {
    selectMonthlyCalendar(
      [_Day(`today`)], _Day(`today`), _Day(`today`),
      `Date Time Calendar | Monthly Square Calendar | This month today | Select`
    );
  });

  registerCommand(`DateTimeCalendar.CalendarSelectMonth`, () => {
    selectDateRange200Year(`SelectMonthCalendar`);
  });
  registerCommand(`DateTimeCalendar.CalendarSelectDate`, () => {
    selectDateRange200Year(`SelectDateCalendar`);
  });

}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
