# vscode-datetime

[![Version][version-badge]][marketplace]
[![Ratings][ratings-badge]][marketplace-ratings]
[![Installs][installs-badge]][marketplace]
[![License][license-badge]][license]

[version-badge]: https://vsmarketplacebadge.apphb.com/version/SatoshiYamamoto.vscode-date-time-calendar.svg
[ratings-badge]: https://vsmarketplacebadge.apphb.com/rating/SatoshiYamamoto.vscode-date-time-calendar.svg
[installs-badge]: https://vsmarketplacebadge.apphb.com/installs/SatoshiYamamoto.vscode-date-time-calendar.svg
[license-badge]: https://img.shields.io/github/license/standard-software/vscode-date-time-calendar.svg

[marketplace]: https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-date-time-calendar
[marketplace-ratings]: https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-date-time-calendar#review-details
[license]: https://github.com/standard-software/vscode-date-time-calendar/blob/master/LICENSE

This extension outputs the date and time and calendar as formatted text

## Insert Output String For example:
- Date
```
2022/01/21(Fri)
Fri, 21 Jan 2022
Friday, 21 January 2022
```

- Time
```
19:58
07:55 PM
```

- Line Vertical Calendar
```
2022/03
  27(Sun)
  28(Mon)
  29(Tue)
  30(Wed)
  31(Thu)
2022/04
  01(Fri)
  02(Sat)
  03(Sun)
...
  23(Sat)
  24(Sun)
  25(Mon)
  26(Tue)
  27(Wed)
  28(Thu)
 [29(Fri)]
  30(Sat)

2022/03
  27  Sun
  28  Mon
  29  Tue
  30  Wed
  31  Thu
2022/04
  01  Fri
  02  Sat
  03  Sun
...
  23  Sat
  24  Sun
  25  Mon
  26  Tue
  27  Wed
  28  Thu
 [29] Fri
  30  Sat
```

- Monthly Square Calendar
```
January                  2022
  Sun Mon Tue Wed Thu Fri Sat
                           1
   2   3   4   5   6   7   8
   9  10  11  12  13  14  15
  16  17  18  19  20 [21] 22
  23  24  25  26  27  28  29
  30  31                    

Jan. 2022
  Mon Tue Wed Thu Fri Sat Sun
  27  28  29  30  31  01  02
  03  04  05  06  07  08  09
  10  11  12  13  14  15  16
  17  18  19  20 [21] 22  23
  24  25  26  27  28  29  30
  31  01  02  03  04  05  06

2022           January
  Mo Tu We Th Fr Sa Su
                  1  2
   3  4  5  6  7  8  9
  10 11 12 13 14 15 16
  17 18 19 20[21]22 23
  24 25 26 27 28 29 30
  31                  

2022/01
  SunMonTueWedThuFriSat
  26 27 28 29 30 31 01
  02 03 04 05 06 07 08
  09 10 11 12 13 14 15
  16 17 18 19 20 21<22
  23 24 25 26 27 28 29
  30 31 01 02 03 04 05
```

## Install

https://marketplace.visualstudio.com/items?itemName=SatoshiYamamoto.vscode-date-time-calendar

## Usage

Following commands are available:

Select Function

- `Date Time Calendar | Select Function`
  - `Date Format : Today Now >>`
    - `Date Today >>`
    - `DateTime Today Now >>`
    - `Time Now >>`

  - `Date Format : Select Date >>`
    - `1922 - 2011 : 100year before >>`
    - `2012 - 2021 : 10year before >>`
    - `2022 : this year >>`
      - `01 - 12 Month >>`
        - `01 - 31 Date >>`
    - `2023 - 2032 : 10year after >>`
    - `2033 - 2122 : 100year after >>`

  - `Calendar : This month today >>`
    - `Line Vertical Calendar >>`
    - `Monthly Square Calendar : Sun - Sat >>`
    - `Monthly Square Calendar : Mon - Sun >>`

  - `Calendar : Select Month >>`
    - Same `Date Format : Select Date`
  - `Calendar : Select Date >>`
    - Same `Date Format : Select Date`

---
or select root menu

- `Date Time Calendar | Date Format | Date Today | Default`
- `Date Time Calendar | Date Format | DateTime Today Now | Default`
- `Date Time Calendar | Date Format | Time Now | Default`
- `Date Time Calendar | Date Format | Date Today | Select`
- `Date Time Calendar | Date Format | DateTime Today Now | Select`
- `Date Time Calendar | Date Format | Time Now | Select`
- `Date Time Calendar | Date Format | Select Date`

- `Date Time Calendar | Line Vertical Calendar | This month today | Select`
- `Date Time Calendar | Monthly Square Calendar | This month today | Select`
- `Date Time Calendar | Calendar | Select Month`
- `Date Time Calendar | Calendar | Select Date`

## Setting

settings.json

```json
{
  "DateTimeCalendar.subMenuMark": ">>",
  "DateTimeCalendar.DateFormat": [
    { "format": "YYYY-MM-DD ddd" },
    { "format": "YYYY/MM/DD(ddd)" },
    { "format": "YYYY.MM.DD" },
    { "format": "YYYYMMDD" },
    { "format": "ddd, DD MMM YYYY" },
    { "format": "dddd, DD MMMMM YYYY" }
    { "format": "YYYY/MM/DD(DDD)" },
    { "format": "YYYY年MM月DD日 DDDD" },
  ],
  "DateTimeCalendar.DateTimeFormat": [
    { "format": "YYYY-MM-DD ddd HH:mm" },
    { "format": "YYYY/MM/DD(ddd) HH:mm" },
    { "format": "YYYY.MM.DD HH:mm" },
    { "format": "YYYYMMDD HH:mm" },
    { "format": "ddd, DD MMM YYYY HH:mm" },
    { "format": "dddd, DD MMMMM YYYY hh:mm AA" },
    { "format": "YYYY/MM/DD(DDD) HH:mm" },
    { "format": "YYYY年MM月DD日 DDDD AAAhh時mm分" }
  ],
  "DateTimeCalendar.TimeFormat": [
    { "format": "HH:mm" },
    { "format": "hh:mm AA" },
    { "format": "AAAhh時mm分" }
  ],
  "DateTimeCalendar.LineVerticalCalendar": [
    {
      "title": "YYYY/MM|  DD(ddd)", "header": "YYYY/MM",
      "line": "  DD(ddd)", "today": " [DD(ddd)]"
    },
    {
      "title": "YYYY/MM|  DD  ddd", "header": "YYYY/MM",
      "line": "  DD  ddd", "today": " [DD] ddd"
    },
    {
      "title": "YYYY/MM|  DD(DDD)", "header": "YYYY/MM",
      "line": "  DD(DDD)", "today": " [DD(DDD)]"
    }
  ],
  "DateTimeCalendar.MonthlySquareCalendar": [
    {
      "title": "MMMMM YYYY ddd D \"Space2\"",
      "header": "LMMMMM                YYYY", "dayOfWeek": "ddd", "date": "SD",
      "indent": "  ", "space": "  ",
      "todayLeft": "[", "todayRight": "]",
      "otherMonthDate": false
    },
    {
      "title": "MMMM YYYY ddd DD \"Space2 OtherMonth\"",
      "header": "MMMM YYYY", "dayOfWeek": "ddd", "date": "DD",
      "indent": "  ", "space": "  ",
      "todayLeft": "[", "todayRight": "]",
      "otherMonthDate": true
    },
    {
      "title": "YYYY MMMMM dd D \"Space1\"",
      "header": "YYYY         RMMMMM", "dayOfWeek": "dd", "date": "SD",
      "indent": "  ", "space": " ",
      "todayLeft": "[", "todayRight": "]",
      "otherMonthDate": false
    },
    {
      "title": "YYYY/MM ddd DD \"Space1 OtherMonth\"",
      "header": "YYYY/MM", "dayOfWeek": "ddd", "date": "DD",
      "indent": "  ", "space": " ",
      "todayLeft": "", "todayRight": "<",
      "otherMonthDate": true
    },
    {
      "title": "YYYY年MM月 DDD DD \"Space2 OtherMonth\"",
      "header": "YYYY年MM月", "dayOfWeek": "DDD", "date": "DD",
      "indent": "", "space": "  ",
      "todayLeft": "", "todayRight": "<-",
      "otherMonthDate": true
    }
  ],
  :
}
```

## Date Format String

> For example  
>  2022/01/09(Sun) 18:05  
>  YYYY/MM/DD(ddd) HH:mm

_ = Space

| Format  | Value     | Memo  |
| -       | -         | -     |
| `YYYY`  | 2022      |
| `YY`    | 22        |
| `MM`    | 01        |
| `M`     | 1         |
| `DD`    | 09        |
| `D`     | 9         |
| `SD`    | _9        | Day leading space-filling, use Weekly or Monthly Calendar
| `HH`    | 18        |
| `H`     | 18        | 0-24
| `hh`    | 06        |
| `h`     | 6         |
| `mm`    | 05        |
| `m`     | 5         |
| `ss`    | 07        |
| `s`     | 7         |
| `SSS`   | 999       | 000-999
| `SS`    | 99        | 00-99
| `S`     | 9         | 0-9
| `aa`    | pm        | am,pm
| `AA`    | PM        | AM,PM
| `a`     | a         | a,p
| `A`     | A         | A,P
| `dd`    | Su        | Su,Mo,Tu,We,Th,Fr,Sa
| `ddd`   | Sun       | Sun,Mon,Tue,Wed,Thu,Fri,Sat
| `dddd`  | Sunday    | Sunday,Monday,Tuesday,...
| `MMM`   | Jan       | Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec
| `MMMM`  | Jan.      | Jan.,Feb.,Mar.,Apr.,May,June,July,Aug.,Sep.,Oct.,Nov.,Dec.
| `MMMMM` | January  
| `Z`     | 09:00     | timezone
| `ZZ`    | 0900      | timezone
| `LMMMMM`| January__ | Left align space-filling
| `RMMMMM`| __January | Right align space-filling
| `DDD`   | 日        | Japanese DayOfWeek text 日,月,火,水,木,金,土
| `DDDD`  | 日曜日    | Japanese DayOfWeek text 日曜日,月曜日,火曜日,...
| `AAA`   | 午後      | Japanese 午前,午後

## License

Released under the [MIT License][license].

## Version

### 1.6.0
2022/04/30(Sat)
- Change Json key
  - "DateTimeCalendar.WeeklyCalendar"
    -> "DateTimeCalendar.LineVerticalCalendar"
  - "DateTimeCalendar.MonthlyCalendar"
    -> "DateTimeCalendar.MonthlySquareCalendar"
  - Settings work fine with the old version key.
- add default date format

### 1.5.0
2022/04/29(Fri)
- Change in menu structure
  - Date Format : Today Now
  - Date Format : Select Date
  - Calendar : Today
  - Calendar : Select Month
  - Calendar : Select Date
- Change Weekly Calendar >> Line Vertical Calendar
- Change Monthly Calendar >> Monthly Square Calendar
- Delete
  - Weekly Calendar Select Week
  - Weekly Calendar Range Week
  - Month Calendar Range many month

### 1.4.0
2022/04/26(Tue)
- Add DateFormat SelectDate
  - before 100 year
  - after 100 year

### 1.3.0
2022/04/24(Sun)
- Sub Menu Char "▸"
  - Changeable in the settings

### 1.2.0
2022/04/19(Tue)
- VSCode Debug Env

### 1.1.0
2022/03/15(Tue)
- Fixed an issue with delayed insertion of the cursor position.
- Fixed problem with insertion of multi-cursor in calendar.

### 1.0.0
2022/01/24(Mon)
- README

### 0.4.0
2022/01/21(Fri)
- Add Monthly Calendar
  - Select Month Period
- Rename ProjectName vscode-datetime >> vscode-date-time-calendar

### 0.3.0
2022/01/12(Wed)
- Select Date Week Sun..Sat / Mon..Sun
- Add Weekly Calendar
  - Select Week Period

### 0.2.0
2021/12/28(Tue)
- Support for Japanese "day of the week".
- Select Multi Formats
- Select Today Now
  Date DateTime Time
- Select Date Yesterday Tomorrow

### 0.1.0
2021/12/22(Wed)
- add DateTime.InsertDateTodayDefaultFormat
