# Weather Dashboard

A weather dashboard built with React, TypeScript and Vite that shows live weather data from the Open-Meteo API. You can search for any city or use your device's location. It shows current conditions, an hourly forecast and daily forecasts of up to 15 days. The theme switches between day and night based on the location you're viewing.

> The user interface is currently available in Turkish.

## Features

- Search weather by city
- Use current device location
- Neighborhood / district / city detection
- Current temperature
- Feels-like temperature
- Humidity
- Wind speed
- Wind direction
- Atmospheric pressure
- Visibility
- UV index
- Precipitation probability
- Sunrise and sunset
- Hourly forecast
- 7-day forecast
- 15-day forecast
- Celsius / Fahrenheit switching
- Favorite locations
- Recent searches
- LocalStorage persistence
- Dynamic day/night theme
- Weather-based atmosphere effects for rain, snow and storms
- Responsive layout

## Tech Stack

| Technology | Purpose |
| --- | --- |
| React | User interface |
| TypeScript | Type safety |
| Vite | Development and build tooling |
| Open-Meteo | Weather, forecast and city search (geocoding) data |
| OpenStreetMap Nominatim | Reverse geocoding (coordinates to place names) |
| BigDataCloud | Fallback reverse geocoding |
| Geolocation API | Current device location |
| LocalStorage | Favorites, recent searches and preferences |
| CSS | Styling, responsive layout and weather animations |

React and React DOM are the only runtime dependencies. The project uses no UI, styling or animation libraries.

## Installation

Requires Node.js 20.19+ or 22.12+.

1. Clone the repository
2. Enter the project directory
3. Install dependencies
4. Start the development server

```bash
git clone <repository-url>
cd weather-dashboard
npm install
npm run dev
```

Then open the local URL that Vite prints (by default `http://localhost:5173`).

The location feature only works in a secure context: `localhost` during development, or HTTPS in production.

## Production Build

```bash
npm run build
```

This type-checks the project and writes the production build to the `dist` folder. You can preview it locally with `npm run preview`.

## Project Structure

```text
src/
├── components/   UI components (search bar, current weather, forecasts, favorites menu, atmosphere effects)
├── hooks/        Custom React hooks for weather loading, daily forecasts, theme and localStorage state
├── services/     API access: Open-Meteo, reverse geocoding, geolocation and error handling
├── types/        Shared TypeScript types for app data and API responses
├── utils/        Helpers for weather codes, temperature units, place names, saved lists and storage
├── App.tsx       Root component that holds the application state
├── main.tsx      Application entry point
└── index.css     Global styles, theme variables, responsive rules and animations
```

## APIs and Data Sources

- **Open-Meteo Forecast API** provides current conditions, hourly data and daily forecasts (`forecast_days` 7 or 15).
- **Open-Meteo Geocoding API** turns a searched city name into coordinates.
- **OpenStreetMap Nominatim** turns device coordinates into a neighborhood, district and city name. It is called only when the user presses the location button.
- **BigDataCloud** (reverse geocoding client endpoint) is used as a fallback when Nominatim is unavailable.

None of these services require an API key.

Place names from Nominatim are OpenStreetMap data, licensed under the [ODbL](https://www.openstreetmap.org/copyright). When a location is resolved through Nominatim, the app shows the required attribution below the weather details ("© OpenStreetMap katkıcıları", the Turkish form of "© OpenStreetMap contributors"). Nominatim's [usage policy](https://operations.osmfoundation.org/policies/nominatim/) limits requests to one per second.

## Design

- Dynamic day/night color palette, based on the viewed location's local day/night data rather than the user's clock
- Lavender and blue-gray daytime theme
- Purple-gray nighttime theme
- Smooth color transitions when the theme changes
- Weather-based atmospheric effects (drizzle, rain, snow and a soft lightning flash), disabled when the system's reduced-motion setting is on
- Responsive design for desktop, tablet and mobile

## Quality Checks

- TypeScript is used throughout the project
- `npm run lint` (Oxlint) passes successfully
- `npm run build` passes successfully

## Future Improvements

- Multi-language support
- PWA support
- Weather notifications
- Map-based location selection

## Developer

Developed by **Özge Altunyuva**.

## License

License information will be added later.
