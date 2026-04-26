![Logo](admin/vis-2-widgets-tibberlink.png)
# ioBroker.vis-2-widgets-tibberlink

[![NPM version](https://img.shields.io/npm/v/iobroker.vis-2-widgets-tibberlink.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-tibberlink)
[![Downloads](https://img.shields.io/npm/dm/iobroker.vis-2-widgets-tibberlink.svg)](https://www.npmjs.com/package/iobroker.vis-2-widgets-tibberlink)
![Number of Installations](https://iobroker.live/badges/vis-2-widgets-tibberlink-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/vis-2-widgets-tibberlink-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.vis-2-widgets-tibberlink.png?downloads=true)](https://nodei.co/npm/iobroker.vis-2-widgets-tibberlink/)

**Tests:** ![Test and Release](https://github.com/ssbingo/ioBroker.vis-2-widgets-tibberlink/workflows/Test%20and%20Release/badge.svg)

## vis-2-widgets-tibberlink adapter for ioBroker

VIS-2 widgets for visualizing Tibber dynamic electricity tariff data: current price, cheapest time window and monthly cost.

More information about Tibber and its dynamic tariffs: <https://tibber.com/>

## Prerequisites

This widget adapter does **not** fetch any data from Tibber itself. It reads states that are created by the data adapter [`iobroker.tibberlink`](https://github.com/hombach/ioBroker.tibberlink). Install and configure `tibberlink` before using these widgets:

1. Install `iobroker.tibberlink` and enter your Tibber API token (from <https://developer.tibber.com/settings/accesstoken>).
2. In the tibberlink settings, enable **"Historical consumption data retrieval"** and set the daily dataset count to at least 31 (required for Widget 3).
3. The price widgets (Widget 1 and 2) work automatically once tibberlink is running — no Calculator channels are needed.

Your **Home ID** is the UUID visible in the ioBroker objects tree under `tibberlink.0.Homes.<UUID>`, e.g. `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

## Changelog
### 0.3.2 (2026-04-26)
* (ssbingo) Widget 2: replace price chart with TibberCheapestWindow (cheapest N-hour sliding window with sparkline)

### 0.3.1 (2026-04-25)
* (ssbingo) Widget 1: rename oid_price→oid_total, add oid_startsAt, show_breakdown and currency options

### 0.3.0 (2026-04-24)
* (ssbingo) New widget: monthly electricity cost with consumption, avg. price and projection

Older changelog entries are in [CHANGELOG_OLD.md](CHANGELOG_OLD.md).

## License
MIT License

Copyright (c) 2026 ssbingo <s.sternitzke@online.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.