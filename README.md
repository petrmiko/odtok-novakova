# Odtok Novákova

Water level monitoring dashboard for a drainage sensor at Novákova street in Dobřany CZE. Fetches data from a [Chytřejší obec](https://chytrejsiobec.cz) IoT device and displays it as an interactive time series.

## Features

- Current water level readout (today's latest measurement)
- Interactive line chart with configurable date range
- Stats table — maximum and median water height for the selected period
- Automatic data resolution: hourly data for ≤31 day ranges, daily averages beyond that
- Dark/light mode (follows system preference)

## Getting started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).
