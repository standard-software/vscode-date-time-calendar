const { isUndefined } = require(`../type/isUndefined.js`);
const { isNull } = require(`../type/isNull.js`);
const { _roundDown } = require(`../number/_roundDown.js`);

const _Datetime = function(
  year = 1970, month = 1, date = 1,
  hours = 0, minutes = 0, seconds = 0, milliseconds = 0,
  timezoneOffset,
) {
  const self = new Date(0);

  if (isUndefined(timezoneOffset)) {
    self.setFullYear(year, month - 1, date);
    self.setHours(hours, minutes, seconds, milliseconds);
  } else if (isNull(timezoneOffset)) {
    self.setUTCFullYear(year, month - 1, date);
    self.setUTCHours(hours, minutes, seconds, milliseconds);
  } else {
    const timezoneOffsetSeconds = (timezoneOffset * 60 - _roundDown(timezoneOffset) * 60);
    self.setUTCFullYear(year, month - 1, date);
    self.setUTCHours(hours, minutes, seconds, milliseconds);
    self.setUTCMinutes(self.getUTCMinutes() + timezoneOffset);
    self.setUTCSeconds(self.getUTCSeconds() + timezoneOffsetSeconds);
  }

  return self;
};

module.exports = { _Datetime };
