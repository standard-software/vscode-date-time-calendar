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

const getFormatArray = (formatName) => {
  if (!([`DateFormat`, `DateTimeFormat`, `TimeFormat`].includes(formatName))) {
    throw new Error(`defaultFormat`);
  }
  const formatData = JSON.parse(
    vscode.workspace.getConfiguration(`DateTime`).get(formatName)
  );
  return Object.values(formatData).map(item => item.format);
};

const getDefaultFormat = (formatName) => {
  return getFormatArray(formatName)[0];
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
    commandQuickPick([
      [`Insert Format`,         ``, () => { select1InsertFormat(); }],
      [`Weekly Calender`,       ``, () => {  }],
      [`Month Calender`,        ``, () => {  }],
      [`Horizontal Calendar`,   ``, () => {  }],
    ], `DateTime | Select Function`);

    select1InsertFormat = () => {
      let select2TodayNow;
      let select2SelectDate;
      commandQuickPick([
        [`Today Now`,     ``, () => { select2TodayNow(); }],
        [`Select Date`,   ``, () => { select2SelectDate(); }],
        [`Input Date`,    ``, () => {  }],
        [`Input Time`,    ``, () => {  }],
      ], `DateTime | Insert Format`);

      select2TodayNow = () => {
        const placeHolder = `DateTime | Insert Format | Today Now`;
        const createCommand = (title, formatName, date) => [
          title,
          ``,
          () => { selectFormat(formatName, date, `${placeHolder} | ${title}`); }
        ];
        commandQuickPick([
          createCommand(`Date Today`,         `Date`,     _Day(`today`)),
          createCommand(`DateTime Today Now`, `DateTime`, new Date()),
          createCommand(`Time Now`,           `Time`,     new Date()),
        ], placeHolder);
      };

      select2SelectDate = () => {
        let select3WeekSunSat;
        const placeHolder = `DateTime | Insert Format | Select Date`;
        const createCommand = (title, formatName, date) => [
          title,
          ``,
          () => { selectFormat(formatName, date, `${placeHolder} | ${title}`); }
        ];
        commandQuickPick([
          createCommand(`Date Yesterday`, `Date`, _Day(`yesterday`)),
          createCommand(`Date Tomorrow`,  `Date`, _Day(`tomorrow`)),
          [`Week Sun..Sat`,  ``, () => { select3WeekSunSat(); }],
          // [`Week Mon..Sun`,  ``, () => {  }],
        ], placeHolder);

        select3WeekSunSat = () => {
          let select4WeekSunSat;
          commandQuickPick([
            [`Last Week`, ``, () => { select4WeekSunSat(`Last`, -7); }],
            [`This Week`, ``, () => { select4WeekSunSat(`This`, 0); }],
            [`Next Week`, ``, () => { select4WeekSunSat(`Next`, 7); }],
          ], `DateTime | Insert Format | Select Date | Week Sun..Sat`);

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

          const getDateWeekSunToSat = (sourceDate) => {
            const result = [];
            const lastSunDay = getBeforeDayOfWeek(
              sourceDate, _dayOfWeek.names.EnglishShort().indexOf(`Sun`)
            );
            result.push(lastSunDay);
            result.push(_Day(1, lastSunDay));
            result.push(_Day(2, lastSunDay));
            result.push(_Day(3, lastSunDay));
            result.push(_Day(4, lastSunDay));
            result.push(_Day(5, lastSunDay));
            result.push(_Day(6, lastSunDay));
            return result;
          };

          select4WeekSunSat = (weekType, dateAdd) => {
            const placeHolder = `DateTime | Insert Format | Select Date | Week Sun..Sat | ${weekType} Week`;
            const createCommand = (title, formatName, date) => [
              title,
              ``,
              () => { selectFormat(formatName, date, `${placeHolder} | ${title}`); }
            ];
            const days = getDateWeekSunToSat(_Day(dateAdd));
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

  });

  const selectFormat = (formatName, targetDate, placeHolder) => {
    formatName = `${formatName}Format`;

    const formatSelectCommands = (formatName, targetDate) => {
      const formatArray = getFormatArray(formatName);
      const selectCommands = formatArray.map(
        format => [
          dateToStringJp(targetDate, format),
          ``,
          () => insertDate(targetDate, format)
        ]
      );
      return selectCommands;
    };

    commandQuickPick(
      formatSelectCommands(formatName, targetDate),
      placeHolder
    );
  };

  const insertDate = (date, format) => {
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

  registerCommand(`DateTime.InsertDateTodayDefaultFormat`, () => {
    insertDate(new Date(), getDefaultFormat(`DateFormat`));
  });
  registerCommand(`DateTime.InsertDateTimeNowDefaultFormat`, () => {
    insertDate(new Date(), getDefaultFormat(`DateTimeFormat`));
  });
  registerCommand(`DateTime.InsertTimeNowDefaultFormat`, () => {
    insertDate(new Date(), getDefaultFormat(`TimeFormat`));
  });

}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
