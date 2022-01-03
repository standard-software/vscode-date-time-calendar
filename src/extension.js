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
        commandQuickPick([
          [`Date Today`,          ``, () => { selectFormat(`DateToday`); }],
          [`DateTime Today Now`,  ``, () => { selectFormat(`DateTimeNow`); }],
          [`Time Now`,            ``, () => { selectFormat(`TimeNow`); }],
        ], `DateTime | Insert Format | Today Now`);
      };

      select2SelectDate = () => {
        let select3WeekSunSat;
        commandQuickPick([
          [`Date Yesterday`,  ``, () => { selectFormat(`DateYesterday`); }],
          [`Date Tomorrow`,   ``, () => { selectFormat(`DateTomorrow`); }],
          [`Week Sun..Sat`,  ``, () => { select3WeekSunSat(); }],
          [`Week Mon..Sun`,  ``, () => {  }],
        ], `DateTime | Insert Format | Select Date`);


      };

    };

  });

  const selectFormat = (commandName) => {

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

    switch (commandName) {

    case `DateToday`: {
      const targetDate = new Date();
      commandQuickPick(
        formatSelectCommands(`DateFormat`, targetDate),
        `DateTime | Insert Format | Today Now | Date Today`
      );
    } break;

    case `DateTimeNow`: {
      const targetDate = new Date();
      commandQuickPick(
        formatSelectCommands(`DateTimeFormat`, targetDate),
        `DateTime | Insert Format | Today Now | DateTime Today Now`
      );
    } break;

    case `TimeNow`: {
      const targetDate = new Date();
      commandQuickPick(
        formatSelectCommands(`TimeFormat`, targetDate),
        `DateTime | Insert Format | Today Now | Time Now`
      );
    } break;

    case `DateYesterday`: {
      const targetDate = _Day(`yesterday`);
      commandQuickPick(
        formatSelectCommands(`DateFormat`, targetDate),
        `DateTime | Insert Format | Today Now | Date Today`
      );
    } break;

    case `DateTomorrow`: {
      const targetDate = _Day(`tomorrow`);
      commandQuickPick(
        formatSelectCommands(`DateFormat`, targetDate),
        `DateTime | Insert Format | Today Now | Date Today`
      );
    } break;

    default: {
      throw new Error(`selectFormat`);
    }
    }
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
