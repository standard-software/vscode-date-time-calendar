const vscode = require(`vscode`);
const {
  isNull, isString,
  _trimFirst,
  _trim,
  _includeCount,
  _indexOfFirst, _indexOfLast,
  _subIndex, _subLength,
  _subLastDelimFirst,
  _dateToString,
  _dayOfWeek,
  _Day,
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
  let date = sourceDate;
  while (true) {
    if (func(date)) {
      return date;
    }
    date = _Day(-1, date);
  }
};

const getBeforeDayOfWeek = (sourceDate, dayOfWeek) => {
  return getBeforeDate(sourceDate, (date) => {
    return date.getDay() === dayOfWeek;
  });
};

const getDateWeekDays = (sourceDate, startWeekDay) => {
  if (![`Sun`, `Mon`].includes(startWeekDay)) {
    throw new Error(`getDateWeekDays startWeekDay`);
  }
  const result = [];
  const weekStartDate = getBeforeDayOfWeek(
    sourceDate, _dayOfWeek.names.EnglishShort().indexOf(startWeekDay)
  );
  result.push(weekStartDate);
  result.push(_Day(1, weekStartDate));
  result.push(_Day(2, weekStartDate));
  result.push(_Day(3, weekStartDate));
  result.push(_Day(4, weekStartDate));
  result.push(_Day(5, weekStartDate));
  result.push(_Day(6, weekStartDate));
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

const getWeeklyCalenderSettings = () =>{
  return vscode.workspace.getConfiguration(`DateTime`).get(`WeeklyCalender`);
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
    let select1WeeklyCalender;
    commandQuickPick([
      [`Insert Format`,         ``, () => { select1InsertFormat(); }],
      [`Weekly Calender`,       ``, () => { select1WeeklyCalender(); }],
      [`Month Calender`,        ``, () => {  }],
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

        select3Week = (weekRangeDayTitle, startWeekDay) => {
          let select4DayOfWeek;
          commandQuickPick([
            [`Last Week`, ``, () => { select4DayOfWeek(`Last`, -7); }],
            [`This Week`, ``, () => { select4DayOfWeek(`This`, 0); }],
            [`Next Week`, ``, () => { select4DayOfWeek(`Next`, 7); }],
          ], `DateTime | Insert Format | Select Date | Week ${weekRangeDayTitle}`);

          select4DayOfWeek = (weekType, dateAdd) => {
            const placeHolder = `DateTime | Insert Format | Select Date | Week ${weekRangeDayTitle} | ${weekType} Week`;
            const createCommand = (title, formatType, date) => [
              title,
              ``,
              () => { selectFormatDate(`${formatType}Format`, date, `${placeHolder} | ${title}`); }
            ];
            const days = getDateWeekDays(_Day(dateAdd), startWeekDay);
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

    select1WeeklyCalender = () => {
      let select2Week;
      const placeHolder = `DateTime | Weekly Calender`;
      commandQuickPick([
        [`Week Sun..Sat`,  ``, () => { select2Week(`Sun..Sat`, `Sun`); }],
        [`Week Mon..Sun`,  ``, () => { select2Week(`Mon..Sun`, `Mon`); }],
      ], placeHolder);

      select2Week = (weekRangeDayTitle, startWeekDay) => {
        const placeHolder = `DateTime | Weekly Calender | Week ${weekRangeDayTitle}`;
        commandQuickPick([
          [`This Week [Today]`, ``,
            () => {
              selectWeeklyCalender(
                _Day(`today`), true, startWeekDay,
                `${placeHolder} | This Week [Today]`
              );
            }
          ],
          [`Select One Week`,   ``,
            () => {  }
          ],
          [`Select Multi Week`, ``,
            () => {  }
          ],
        ], placeHolder);
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

  const selectWeeklyCalender = (targetDate, optionToday, startWeekDay, placeHolder) => {
    commandQuickPick(
      getWeeklyCalenderSettings().map(
        setting => [
          setting.title,
          ``,
          () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
              vscode.window.showInformationMessage(`No editor is active`);
              return;
            }

            const days = getDateWeekDays(targetDate, startWeekDay);
            let weeklyCalText = dateToStringJp(targetDate, setting.header);
            weeklyCalText += `\n`;
            for (const day of days) {
              if (optionToday && dateToStringJp(day, `YYYYMMDD`) === dateToStringJp(_Day(`today`), `YYYYMMDD`)) {
                weeklyCalText += dateToStringJp(day, setting.today);
              } else {
                weeklyCalText += dateToStringJp(day, setting.line);
              }
              weeklyCalText += `\n`;
            }

            editor.edit(editBuilder => {
              const selection = editor.selections[0];
              editBuilder.replace(selection, ``);
              editBuilder.insert(selection.active, weeklyCalText);
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
