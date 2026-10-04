# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Turkish weather dashboard built with **React 19 + TypeScript + Vite**. It shows real weather data from the public **Open-Meteo** APIs (geocoding plus forecast). There is no backend and no API key. For "use my location", coordinates are turned into place names (Open-Meteo has no reverse geocoding) by **OpenStreetMap Nominatim** (primary; its attribution text must be shown) and BigDataCloud's keyless `reverse-geocode-client` (fallback). The default city is **Elazığ**, and it loads on startup.

Working features. These must not be removed or broken:
- City search (`SearchBar`, geocoded through Open-Meteo)
- "Use my location" (`Konumumu kullan`): a crosshair button inside the search pill (`.search__locate`). It uses the browser Geolocation API with a fresh position on every press, and it is clickable even during another load (that request is aborted). It shows the most detailed place found, for example `İzzetpaşa Mahallesi` / `Merkez, Elazığ` / `Türkiye`. The weather is fetched for the user's **real coordinates**, not a city center. Location results go into recent searches and favorites like a normal search, and the theme follows them.
- Current weather: temperature, description, today's high and low, feels-like temperature, humidity, wind speed (`CurrentWeatherCard`)
- Hourly forecast: the next 12 hours, starting with "Şimdi" (`HourlyForecast`)
- Daily forecast with **7 Günlük / 15 Günlük** tabs (`ForecastList` / `ForecastCard`). The default is 7, and the choice is saved in localStorage (`forecast-range`). Each row shows the day name, a short date ("6 Eki"), the description, the icon, the low, the range bar and the high.
- Weather details: precipitation probability, pressure, visibility, UV index (current value plus today's max), sunrise, sunset, wind direction (`WeatherDetails`)
- °C / °F toggle (`UnitToggle`), saved in localStorage
- Recent searches (`CityChipList`), saved in localStorage, at most 5
- Favorites, saved in localStorage:
  - The **star next to the city name** (`FavoriteButton` in `CurrentWeatherCard`) adds or removes the **currently shown** city.
  - The **star in the Navbar** (`FavoritesMenu`) opens a dropdown that lists **all** favorite cities. You can select or remove a city there. The menu closes on outside click, Escape, or tabbing out, and it has a count badge.

## Commands

- `npm run dev`: start the app (Vite dev server with HMR). **Use this to run the project.**
- `npm run build`: type-check (`tsc -b`) and then the production build into `dist/`
- `npm run lint`: Oxlint (`.oxlintrc.json`: react, typescript and oxc plugins; `rules-of-hooks` is an error)
- `npm run preview`: serve the built `dist/`

The project already exists. **Never run `npm create vite`** or re-scaffold it. If `node_modules` is missing, run `npm install`.

There is no test framework. `npm run build` is the type-check gate. `tsconfig.app.json` turns on `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (type-only imports must use `import type`) and `erasableSyntaxOnly` (no enums, namespaces or parameter properties).

## Ground rules

- Keep every working feature listed above. Changes should add to them, not replace them.
- **Don't add unnecessary libraries.** The only runtime dependencies are `react` and `react-dom`. Icons are hand-written SVG components (`Icon.tsx`, `WeatherIcon.tsx`). Styling is plain CSS. Data fetching uses `fetch`.
- **Keep API logic in `src/services/`** (`weatherService.ts`). Components and hooks must not call `fetch` or build Open-Meteo URLs.
- Keep the TypeScript structure. Shared types live in `src/types/weather.ts`. Avoid `any`. Validate untrusted data (API responses, localStorage) with type guards or null checks.
- Keep the layout responsive. The breakpoints in `index.css` are 860px, 640px and 380px, and there is a `prefers-reduced-motion` block.
- **All user-facing text must be Turkish** (labels, `aria-label`, `title`, error messages). Use `tr-TR` for number and date formatting. Code comments are also in Turkish.

## Architecture

**Folders:** `components/` (presentational UI), `hooks/` (`useWeather`, `useLocalStorage`), `services/` (Open-Meteo access and data mapping), `types/` (domain and API types), `utils/` (temperature conversion, WMO code table, city list helpers, localStorage helpers).

**Data flow:** `App.tsx` → `hooks/useWeather` → `services/weatherService` → Open-Meteo.
- `services/errors.ts`: `WeatherError`, `toErrorInfo` and the Turkish error titles. `services/http.ts`: the shared `fetchJson`. `services/geolocation.ts`: a promise wrapper around `navigator.geolocation`. It validates coordinates and maps unsupported, insecure-context, denied, timeout and unavailable cases to `location-*` error kinds (the messages say the shown city did not change), and it can be aborted.
- `weatherService.ts` geocodes a city name (`getWeatherByCity`; it takes the first of 10 results whose name matches the query exactly, because Open-Meteo sometimes ranks an alias match first, e.g. "Kadıköy" → "Babadağ"), or uses a saved `CityLocation` directly (`getWeatherByLocation`). It maps the raw `ForecastResponse` into the normalized `WeatherData` (`current`, `details`, `hourly`, `forecast`). All formatting happens at this mapping step: Turkish day names, wind direction labels, UV levels, visibility in km.
- `getWeatherForCurrentPosition` gets the position, then calls `services/reverseGeocoding.ts`. That tries Nominatim first, then BigDataCloud, and maps either result into `PlaceParts` (`neighbourhood` / `district` / `city` / `country`). Nominatim fields for Turkey: `suburb` is the mahalle (or `village` in rural areas), `town` is the ilçe (and `"Elâzığ Merkez"` is shortened to `Merkez`), `province` is the il. BigDataCloud admin levels: 8 is mahalle, 6/7 is ilçe, 4 is il.
  - Location ids are `place:<country|city|district|mahalle>`, normalized (case, diacritics and spaces ignored, "Mahallesi" suffix dropped). The same mahalle gives the same id from either service.
- Errors are thrown as `WeatherError` with a `kind` (`not-found` | `network` | `server` | `location-denied` | `location-unsupported` | `location-unavailable`). `toErrorInfo` turns them into Turkish title and message pairs for `StatusMessage`. Not-found and location errors use the warning style. Unexpected errors fall back to a generic `server` message. Abort errors are rethrown unchanged.
- `useWeather` owns loading and error state. Both `loadWeather(query)` and `loadCurrentLocation()` run a loader `(signal) => Promise<WeatherData>` through the same `fetchWeather`, and a new request aborts the one in flight (`AbortController` in a ref). `isLocating` marks a location request, so the spinner and the "Konumunuz bulunuyor…" text show on the locate button instead of the "Ara" button. It also refreshes stale data silently: every minute and on `visibilitychange`, it refetches the current location if the data is older than 15 minutes, without showing loading or error UI. The `onSuccess` callback passed to `loadWeather` is how `App` adds a city to recent searches, and only searches the user started count.
- **7/15-day forecast:** the main request uses `forecast_days=7`, and the 7-day view reuses `weather.forecast` with no extra request. `hooks/useDailyForecast` calls `getDailyForecast(location, 15)` (daily fields only, `forecast_days=15`; Open-Meteo allows up to 16) when the 15-day view is shown. The result is tied to the current `weather` object: it refetches on a city or location change and on the background refresh, but not when switching tabs back and forth. While it loads, the 7-day list is shown dimmed. If the request fails, the 7-day list is shown with a Turkish notice, and if fewer than 15 days come back, a notice says how many. `mapDailyForecast` skips days with missing values instead of inventing them.
- `App.tsx` holds all state (weather, recent, favorites, unit, forecast range) and passes it down. Components get everything through props.

**Places (`CityLocation`) and names:**
- Structured fields: `source` (`'search'` | `'location'`), `displayName` (title, never empty), optional `neighbourhood` / `district` / `city` / `region` (Open-Meteo `admin1` for searches), `country`, `latitude` / `longitude`, and optional `attribution`. Location results store the user's real coordinates. Saved favorites and recent searches always reopen through `getWeatherByLocation` with their coordinates, never through a text search.
- **Never build display text by hand.** Use `utils/locationLabel.ts`:
  - `getLocationLabel` returns `{ title, subtitle?, detail? }` following the standard: for a location result, mahalle / "İlçe, Şehir" / Ülke, then İlçe / Şehir / Ülke, then Şehir / Ülke; for a search result, Şehir / Bölge / Ülke. Repeats are dropped ("Elazığ, Elazığ" never appears), and empty values are never shown.
  - `getShortLocationName` gives short chip labels ("Caferağa Mah."). `getFullLocationName` is for tooltips.
- **Duplicate rule:** `isSamePlace` means the same `id`, or the same normalized title within 5 km. The helpers in `utils/cityList.ts` (`addToRecent`, `addUnique`, `removePlace`, `containsPlace`) and the active highlighting in chips and favorites all use it.
- **Storage format:** `parseStoredCity` / `parseStoredCityList` read the current format and also the old v1 format `{ id, name, country, lat, lon, area? }`. v1 is converted by inferring `source` from the id (`place:` or coordinates means location) and splitting `area` into ilçe/şehir. Invalid entries are skipped. The list is migrated on read, and `useLocalStorage` writes it back in the new format.

**Background atmosphere:** `components/WeatherAtmosphere` gets **`weather.current.weatherCode`** (the raw Open-Meteo WMO code, never the description text) and picks its type with `getAtmosphere` in `utils/weatherCodes.ts`. It updates automatically on a city change, on "use my location", and on the background refresh.
- drizzle: 51, 53, 55, 56, 57 (one faint layer)
- rain: 61, 63, 65, 66, 67, 80, 81, 82 (two layers)
- snow: 71, 73, 75, 77, 85, 86
- storm: 95, 96, 99 (slightly faster rain plus a soft flash about every 19 s)
- Any other code (0–3 clear/cloudy, 45/48 fog) has no animation.

It is pure CSS (`.atmosphere*` in `index.css`, with per-type differences set through `--duration` and opacity). Each layer is one element with tiled radial-gradient particles moved only by `transform`. It sits fixed at `z-index: -1` between the sky and the stars, behind the content. Only `prefers-reduced-motion: reduce` hides it. There is no test mode; to try a code, intercept the forecast response (for example over Chrome DevTools Protocol).

**Conventions that span files:**
- Temperatures are always stored in °C. The C/F unit is applied only at display time, through `utils/temperature.ts`.
- Open-Meteo times are in the location's local time (`timezone: 'auto'`). They are handled as strings (`formatTime` takes `HH:MM` from the ISO text) and never through `Date`, so the browser's time zone cannot shift them.
- Missing API values become `null` in `WeatherDetails` / `HourlyForecast`, and the UI shows those as "Veri yok". When you add a forecast field, add it to `fetchForecast`'s params, to `ForecastResponse` (as optional or nullable), to the domain type, and to the mapper.
- WMO weather codes map to a `WeatherCondition` plus a Turkish description in `utils/weatherCodes.ts`. The `isDay` flag (from Open-Meteo's `is_day`) is carried on `current` and on each hourly entry.
- Persistence goes through `useLocalStorage(key, fallback, parse)`. Keys are declared in `STORAGE_KEYS` in `utils/storage.ts` and get the `weather-dashboard:` prefix. `parse(value) => T | null` validates and migrates old formats (`parseStoredCityList`, `parseTemperatureUnit`, `parseForecastRange`). `null` or corrupt JSON falls back silently. **If you change a stored shape, keep reading the old one in its parser.**

## Design and theme

- A modern, purple-gray weather-app look ("evening sky" glassmorphism): a gradient sky background (`--sky-top` … `--sky-bottom`, drawn on `body::before`), translucent glass cards (`--glass*`), a lavender accent (`--accent*`) and a warm highlight (`--warm*`).
- All styling is in one global stylesheet, `src/index.css`: BEM-like class names (`hero__temp`, `favorites-menu__panel`) and `is-*` state classes (`is-active`, `is-open`, `is-loading`). There are no CSS modules and no CSS framework. Reuse the existing CSS variables instead of hard-coding colors.
- **Dynamic day/night theme:** `hooks/useDayNightTheme` sets `<html data-theme="day|night">` from `weather.current.isDay`, which comes from the searched city's Open-Meteo `is_day`, not the user's clock. The theme switches on city change and on the silent background refresh. `index.html` starts with `data-theme="night"`, and the theme is left unchanged while there is no data.
  - `:root` holds the night palette (the original purple-gray look). `:root[data-theme='day']` overrides the same variables with light blue-gray/lavender sky, bright white glass cards and dark navy text. Stars (`body::after`) fade out by day.
  - The color variables are registered with `@property` (`<color>`) and listed in `:root`'s `transition-property`. This is how the gradient sky cross-fades over `--theme-duration`. **When you add a new themed color variable, register it with `@property`, add it to that list, and give it a day override.** Never hard-code colors in component rules. Use the variables or `color-mix(in srgb, var(--x) N%, transparent)` for tints (for example tracks, scrollbars, shadows via `--shadow-color`).
  - `--text-inverse` / `--text-emphasis` are for buttons filled with `--text` (°C/°F active, "Ara", badge).
  - Icons follow their own `isDay`: the hero and Navbar logo use the current `isDay`, and each hourly item uses its own hour's `isDay` (`WeatherIcon` `PALETTES.day/night`).
