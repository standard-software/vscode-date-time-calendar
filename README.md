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

- Weekly Calendar
```
2022/01  
  17(Mon)  
  18(Tue)  
  19(Wed)
  20(Thu)
 [21(Fri)]
  22(Sat)
  23(Sun)

2022/01
  16  Sun
  17  Mon
  18  Tue
  19  Wed
  20  Thu
 [21] Fri
  22  Sat
```

- Monthly Calendar
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
  - `Date Format >>`
    - `Today Now >>`
      - `Date Today >>`
      - `DateTime Today Now >>`
      - `Time Now >>`
    - `Select Date >>`
      - `Date Yesterday >>`
      - `Date Tomorrow >>`
      - `Week Sun..Sat >>`
        - Select Day Last To Next Week
      - `Week Mon..Sun >>`
        - Select Day Last To Next Week

  - `Weekly Calendar >>`
    - `Week Sun..Sat >>`
      - `This Week [Today] >>`
      - `Select Week >>`
        - `Last Week >>`
        - `This Week >>`
        - `Next Week >>`
        - `Last To Next 3Weeks [Today] >>`
        - `This Month [Today] >>`
        - `Last To Next 3Months [Today] >>`
        - `This Year [Today] >>`
        - `Last To Next 3Years [Today] >>`
    - `Week Mon..Sun >>`
      - Same as above

  - `Monthly Calendar >>`
    - `Week Sun..Sat >>`
      - `This Month [Today] >>`
      - `Select Month >>`
        - `Last Week >>`
        - `This Week >>`
        - `Next Week >>`
        - `Last To Next 3Month [Today] >>`
        - `This Year [Today] >>`
        - `Last To Next 3Years [Today] >>`
    - `Week Mon..Sun >>`
      - Same as above

---
or select root menu

- `Date Time Calendar | Date Format | Date Today | Default`
- `Date Time Calendar | Date Format | DateTime Today Now | Default`
- `Date Time Calendar | Date Format | Time Now | Default`
- `Date Time Calendar | Date Format | Date Today | Select`
- `Date Time Calendar | Date Format | DateTime Today Now | Select`
- `Date Time Calendar | Date Format | Time Now | Select`
<!-- 
- `Date Time Calendar | Date Format | Date Yesterday | Default`
- `Date Time Calendar | Date Format | Date Tomorrow | Default`
- `Date Time Calendar | Date Format | Date Yesterday | Select`
- `Date Time Calendar | Date Format | Date Tomorrow | Select`
- `Date Time Calendar | Date Format | Sun..Sat Last To Next Week | Select`
- `Date Time Calendar | Date Format | Mon..Sun Last To Next Week | Select`
-->
- `Date Time Calendar | Date Format | Select Date`

- `Date Time Calendar | Weekly Calendar | Sun..Sat | This Week [Today] | Select`
- `Date Time Calendar | Weekly Calendar | Sun..Sat | Last Week | Select`
- `Date Time Calendar | Weekly Calendar | Sun..Sat | This Week | Select`
- `Date Time Calendar | Weekly Calendar | Sun..Sat | Next Week | Select`
- `Date Time Calendar | Weekly Calendar | Sun..Sat | Last To Next 3Weeks [Today] | Select`
- `Date Time Calendar | Weekly Calendar | Sun..Sat | This Month | Select`
- `Date Time Calendar | Weekly Calendar | Sun..Sat | Last To Next 3Month [Today] | Select`
- `Date Time Calendar | Weekly Calendar | Sun..Sat | This Year [Today] | Select`
- `Date Time Calendar | Weekly Calendar | Sun..Sat | Last To Next 3Year [Today] | Select`

- `Date Time Calendar | Weekly Calendar | Mon..Sun | This Week [Today] | Select`
- `Date Time Calendar | Weekly Calendar | Mon..Sun | Last Week | Select`
- `Date Time Calendar | Weekly Calendar | Mon..Sun | This Week | Select`
- `Date Time Calendar | Weekly Calendar | Mon..Sun | Next Week | Select`
- `Date Time Calendar | Weekly Calendar | Mon..Sun | Last To Next 3Weeks [Today] | Select`
- `Date Time Calendar | Weekly Calendar | Mon..Sun | This Month | Select`
- `Date Time Calendar | Weekly Calendar | Mon..Sun | Last To Next 3Month [Today] | Select`
- `Date Time Calendar | Weekly Calendar | Mon..Sun | This Year [Today] | Select`
- `Date Time Calendar | Weekly Calendar | Mon..Sun | Last To Next 3Year [Today] | Select`

- `Date Time Calendar | Monthly Calendar | Sun..Sat | This Month [Today] | Select`
- `Date Time Calendar | Monthly Calendar | Sun..Sat | Last Month | Select`
- `Date Time Calendar | Monthly Calendar | Sun..Sat | This Month | Select`
- `Date Time Calendar | Monthly Calendar | Sun..Sat | Next Month | Select`
- `Date Time Calendar | Monthly Calendar | Sun..Sat | Last To Next 3Month | Select`
- `Date Time Calendar | Monthly Calendar | Sun..Sat | This Year | Select`
- `Date Time Calendar | Monthly Calendar | Sun..Sat | Last To Next 3Year | Select`

- `Date Time Calendar | Monthly Calendar | Mon..Sun | This Month [Today] | Select`
- `Date Time Calendar | Monthly Calendar | Mon..Sun | Last Month | Select`
- `Date Time Calendar | Monthly Calendar | Mon..Sun | This Month | Select`
- `Date Time Calendar | Monthly Calendar | Mon..Sun | Next Month | Select`
- `Date Time Calendar | Monthly Calendar | Mon..Sun | Last To Next 3Month | Select`
- `Date Time Calendar | Monthly Calendar | Mon..Sun | This Year | Select`
- `Date Time Calendar | Monthly Calendar | Mon..Sun | Last To Next 3Year | Select`

## Setting

settings.json

```json
{
  "DateTimeCalendar.subMenuMark": ">>",
  "DateTimeCalendar.DateFormat": [
    { "format": "YYYY/MM/DD(ddd)" },
    { "format": "ddd, DD MMM YYYY" },
    { "format": "dddd, DD MMMMM YYYY" }
    { "format": "YYYY/MM/DD(DDD)" },
    { "format": "YYYY年MM月DD日 DDDD" },
  ],
  "DateTimeCalendar.DateTimeFormat": [
    { "format": "YYYY/MM/DD(ddd) HH:mm" },
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
  "DateTimeCalendar.WeeklyCalendar": [
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
  "DateTimeCalendar.MonthlyCalendar": [
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
