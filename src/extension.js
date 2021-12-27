const vscode = require(`vscode`);
const {
  // isUndefined,
  isNull,
  _trimFirst,
  _trim,
  _includeCount,
  _indexOfFirst, _indexOfLast,
  _subIndex, _subLength,
  // _stringToIntegerDefault,
  _subLastDelimFirst,
  _dateToString,
  _dayOfWeek,
} = require(`./parts/parts.js`);

const dayOfWeekJapaneseShort = (date, timezoneOffset) => {
  return _dayOfWeek.names.JapaneseShort()[
    _dateToString.rule.dayOfWeek(date, timezoneOffset)
  ];
};

const dayOfWeekJapaneseLong = (date, timezoneOffset) => {
  return _dayOfWeek.names.JapaneseLong()[
    _dateToString.rule.dayOfWeek(date, timezoneOffset)
  ];
};

const dateToStringSupportJapanese = (date, format) => {
  const rule = _dateToString.rule.Default();
  rule[`DDD`] = { func: dayOfWeekJapaneseShort };
  rule[`DDDD`] = { func: dayOfWeekJapaneseLong };
  return _dateToString(
    date, format, undefined, rule,
  );
};

const loopSelectionsLines = (editor, func) => {
  for (const { start, end } of editor.selections) {
    for (let i = start.line; i <= end.line; i += 1) {
      if (
        start.line !== end.line &&
        i === end.line &&
        end.character === 0
      ) {
        break;
      }
      func(i);
    }
  }
};

const getIndent = (line) => {
  return line.length - _trimFirst(line, [` `, `\t`]).length;
};

const getMinIndent = (editor) => {
  let minIndent = Infinity;
  loopSelectionsLines(editor, i => {
    const {text} = editor.document.lineAt(i);
    if (_trim(text) === ``) { return; }
    const indent = getIndent(text);
    if (indent < minIndent) {
      minIndent = indent;
    }
  });
  if (minIndent === Infinity) { minIndent = 0; }
  return minIndent;
};

const getMinIndentExcludeLineNumber = (editor) => {
  let minIndent = Infinity;
  loopSelectionsLines(editor, i => {
    const {text} = editor.document.lineAt(i);
    if (_trim(text) === ``) { return; }
    if (isNull(_trim(text).match(/^\d+:+.*$/))) { return; }
    const colonAfterText = _subLastDelimFirst(text, `: `);
    if (_trim(colonAfterText) === ``) { return; }
    const indent = getIndent(colonAfterText);
    if (indent < minIndent) {
      minIndent = indent;
    }
  });
  if (minIndent === Infinity) { minIndent = 0; }
  return minIndent;
};

const getMaxFileLineNumberDigit = (editor) => {
  let result = 0;
  loopSelectionsLines(editor, i => {
    result = Math.max(result, i.toString().length);
  });
  return result;
};

const getInputLineNumberDigit = (editor, lineNumber) => {
  let result = 0;
  loopSelectionsLines(editor, () => {
    result = Math.max(result, lineNumber.toString().length);
    lineNumber += 1;
  });
  return result;
};

const getLineTextInfo = (editor, lineIndex) => {
  const lineAt = editor.document.lineAt(lineIndex);
  const { text } = lineAt;
  const textIncludeLineBreak = editor.document.getText(
    lineAt.rangeIncludingLineBreak
  );
  const lineBreak = _subLength(textIncludeLineBreak, text.length);
  return {
    text, textIncludeLineBreak, lineBreak
  };
};

const getDefaultLineBreak = (editor) => {
  let text = ``;
  for (let selection of editor.selections) {
    const range = new vscode.Range(
      selection.start.line,
      0,
      selection.end.line,
      getLineTextInfo(
        editor, selection.end.line
      ).textIncludeLineBreak.length
    );
    text += editor.document.getText(range);
  }

  const crlf = _includeCount(text, `\r\n`);
  const cr = _includeCount(text, `\r`);
  const lf = _includeCount(text, `\n`);
  let most = ``;
  if (crlf < cr) {
    most = `cr`;
    if (cr < lf) {
      most = `lf`;
    }
  } else {
    most = `crlf`;
    if (crlf < lf) {
      most = `lf`;
    }
  }

  if (most === `crlf`) {
    return `\r\n`;
  } else if (most === `cr`) {
    return `\r`;
  } else if (most === `lf`) {
    return `\n`;
  } else {
    throw new Error(`getDefaultLineBreak`);
  }
};

const getPathFileName = (editor) => {
  let delimiterIndex = _indexOfLast(editor.document.fileName, `\\`);
  if (delimiterIndex === -1) {
    delimiterIndex = _indexOfLast(editor.document.fileName, `/`);
  }

  let path = ``;
  let filename = ``;
  if ([-1, 0].includes(delimiterIndex)) {
    filename = editor.document.fileName;
  } else {
    path = _subIndex(editor.document.fileName, 0, delimiterIndex);
    filename = _subLength(editor.document.fileName, delimiterIndex + 1);
  }
  return {
    path, filename
  };
};

const lineNumberTextNoFormat = (editor) => {
  const delimiter = `: `;
  let result = ``;
  const numberDigit = getMaxFileLineNumberDigit(editor);
  loopSelectionsLines(editor, i => {
    const { textIncludeLineBreak } = getLineTextInfo(editor, i);
    const lineNumber = (i + 1).toString().padStart(numberDigit, `0`);
    result += `${lineNumber}${delimiter}${textIncludeLineBreak}`;
  });
  return result;
};

const lineNumberTextDeleteIndent = (editor) => {
  const delimiter = `: `;
  let result = ``;
  const numberDigit = getMaxFileLineNumberDigit(editor);
  const minIndent = getMinIndent(editor);
  loopSelectionsLines(editor, i => {
    const { text, lineBreak } = getLineTextInfo(editor, i);
    const lineNumber = (i + 1).toString().padStart(numberDigit, `0`);
    result += `${lineNumber}${delimiter}${_subLength(text, minIndent)}${lineBreak}`;
  });
  return result;
};

const lineNumberTextDeleteLineNumber = (editor) => {
  const delimiter = `: `;
  const trimDelimiter = _trim(delimiter);
  let result = ``;
  loopSelectionsLines(editor, i => {
    const { text, lineBreak } = getLineTextInfo(editor, i);
    if (isNull(_trim(text).match(`^\\d+${trimDelimiter}+.*$`))) {
      result += text + lineBreak;
      return;
    }
    let colonIndex = _indexOfFirst(text, delimiter);
    if (colonIndex !== -1) {
      result += _subLastDelimFirst(text, delimiter) + lineBreak;
    } else {
      colonIndex = _indexOfFirst(text, trimDelimiter);
      if (colonIndex !== -1) {
        result += _subLastDelimFirst(text, trimDelimiter) + lineBreak;
      }
    }
  });
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
      commandQuickPick([
        [`Today Now`,     ``, () => { select2TodayNow(); }],
        [`Select Date`,   ``, () => {  }],
        [`Input Date`,    ``, () => {  }],
        [`Input Time`,    ``, () => {  }],
      ], `DateTime | Insert Format`);

      select2TodayNow = () => {
        let select3DateToday;
        commandQuickPick([
          [`Date Today`,    ``, () => { select3DateToday(); }],
          [`DateTime Now`,  ``, () => {  }],
          [`Time Now`,      ``, () => {  }],
        ], `DateTime | Insert Format | Today Now`);

        select3DateToday = () => {
          commandQuickPick([
            [`Date Today`,    ``, () => { mainInsertFormat(`DateTodaySelectFormat`); }],
            [`DateTime Now`,  ``, () => {  }],
            [`Time Now`,      ``, () => {  }],
          ], `DateTime | Insert Format | Today Now | Date Today`);
        };
      };

    };

  });

  const mainInsertFormat = (commandName) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage(`No editor is active`);
      return;
    }

    switch (commandName) {

    case `DateTodayDafaultFormat`: {
      // const delimiter = `: `;
      // editor.edit(editBuilder => {
      //   const numberDigit = getMaxFileLineNumberDigit(editor);
      //   loopSelectionsLines(editor, i => {
      //     const lineNumberText = (i + 1).toString().padStart(numberDigit, `0`);
      //     editBuilder.insert(new vscode.Position(i, 0), `${lineNumberText}${delimiter}`);
      //   });
      // });
    } break;

    case `DateTodaySelectFormat`: {
      // const delimiter = `: `;
      // editor.edit(editBuilder => {
      //   const numberDigit = getMaxFileLineNumberDigit(editor);
      //   loopSelectionsLines(editor, i => {
      //     const lineNumberText = (i + 1).toString().padStart(numberDigit, `0`);
      //     editBuilder.insert(new vscode.Position(i, 0), `${lineNumberText}${delimiter}`);
      //   });
      // });
    } break;

    }

  };

  const selectFormat = (commandName) => {
    switch (commandName) {

    case `DateTodayDafaultFormat`: {
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
        editBuilder.insert(selection.active, dateToStringSupportJapanese(date, format));
      }
    });
  };

  registerCommand(`DateTime.InsertDateTodayDefaultFormat`, () => {
    insertDate(new Date(), `YYYY/MM/DD(DDD)`);
  });

}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
