<div align="center">

# 🌦️ Weather Dashboard

### Modern, location-aware weather forecasting with dynamic themes

A responsive weather application built with **React, TypeScript and Vite**, providing real-time weather data, location-aware forecasts, favorites, detailed weather metrics and dynamic atmospheric effects.

> The application interface is currently available in Turkish.

<br>

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Open-Meteo](https://img.shields.io/badge/Open--Meteo-Weather_API-4A90E2?style=for-the-badge)

</div>

---

## ✨ About

**Weather Dashboard** is a modern weather application designed to provide detailed and location-aware weather information in a clean and responsive interface.

Users can search for cities manually or use their device location to retrieve weather information for their current area. When location access is used, the application can display more detailed location information such as **neighborhood, district and city**.

The interface automatically adapts between **day and night themes** depending on the selected location, while weather conditions such as rain can trigger subtle atmospheric animations.

---

## 🚀 Features

- 🔍 Search weather by city
- 📍 Detect current device location
- 🏘️ Neighborhood, district and city detection
- 🌡️ Current temperature
- 🤒 Feels-like temperature
- 💧 Humidity
- 💨 Wind speed and direction
- 🌧️ Precipitation probability
- 🌡️ Atmospheric pressure
- 👁️ Visibility
- ☀️ UV index
- 🌅 Sunrise and sunset
- 🕐 Hourly weather forecast
- 📅 7-day forecast
- 📆 15-day forecast
- 🌡️ Celsius / Fahrenheit switching
- ⭐ Favorite locations
- 🕘 Recent searches
- 💾 Persistent preferences with LocalStorage
- 🌞 Dynamic daytime theme
- 🌙 Dynamic nighttime theme
- 🌧️ Weather-based atmospheric effects
- 📱 Responsive design for desktop, tablet and mobile

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React** | User interface and component architecture |
| **TypeScript** | Type safety and maintainable code |
| **Vite** | Development server and production build |
| **Open-Meteo API** | Current weather and forecast data |
| **Open-Meteo Geocoding** | City search and coordinate lookup |
| **OpenStreetMap Nominatim** | Reverse geocoding |
| **BigDataCloud** | Reverse geocoding fallback |
| **Browser Geolocation API** | Detecting the user's current position |
| **LocalStorage** | Favorites, recent searches and preferences |
| **CSS** | Responsive design, themes and animations |

---

## 🎨 Dynamic Weather Experience

The application does more than display weather values.

### Day & Night Themes

The interface automatically changes according to the **local day/night status of the selected location**.

**Day**
- Light lavender and blue-gray palette
- Bright weather icons
- Soft cards and backgrounds

**Night**
- Purple-gray color palette
- Darker cards and surfaces
- Moon and nighttime weather visuals

### Weather Effects

Atmospheric effects are automatically triggered using real weather codes.

- 🌧️ Rain → subtle rain animation
- ❄️ Snow → snow animation
- ⛈️ Thunderstorm → light storm effect
- ☀️ Clear / Cloudy → clean background without unnecessary effects

---

## 📍 Location-Aware Weather

The application can use the browser's Geolocation API to retrieve the user's coordinates.

When available, location information can be displayed in a detailed format such as:

```text
İzzet Paşa Mahallesi
Merkez, Elazığ
Türkiye
```

Weather forecasts are then requested using the detected coordinates instead of relying only on the city center.

---

## ⭐ Favorites & Recent Searches

Favorite locations and recent searches are stored locally in the browser.

This allows users to:

- Save frequently checked locations
- Quickly reopen favorite places
- Access recently searched cities
- Keep preferences after refreshing or reopening the application

Favorite locations also store coordinate information when available, helping prevent incorrect matches between locations with similar names.

---

## 📊 Forecasts

### Hourly Forecast

Displays weather conditions for the upcoming hours including:

- Time
- Weather condition
- Weather icon
- Temperature

### Daily Forecast

Users can switch between:

- **7-Day Forecast**
- **15-Day Forecast**

Each forecast includes:

- Day and date
- Weather condition
- Weather icon
- Minimum temperature
- Maximum temperature
- Visual temperature range

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/altunyuvao/weather-dashboard.git
```

### 2. Enter the project directory

```bash
cd weather-dashboard
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Vite will provide a local development address, usually:

```text
http://localhost:5173
```

---

## 📦 Production Build

Create an optimized production build with:

```bash
npm run build
```

The generated production files will be available inside the:

```text
dist/
```

directory.

---

## 📁 Project Structure

```text
weather-dashboard/
│
├── public/
│
├── src/
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   ├── services/     # Weather, geolocation and API services
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Helper and conversion functions
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── README.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🌐 Data Sources

### Open-Meteo

Used for:

- Current weather
- Hourly forecasts
- 7-day forecasts
- 15-day forecasts
- Weather codes
- Geocoding

No API key is required for the current Open-Meteo integration.

### OpenStreetMap Nominatim

Used for reverse geocoding to convert coordinates into readable location information such as neighborhood, district and city.

### BigDataCloud

Used as a fallback reverse-geocoding service when required.

---

## ✅ Quality Checks

The project has been checked with:

```bash
npm run lint
npm run build
```

Current status:

- ✅ ESLint passed
- ✅ Production build passed
- ✅ No remaining build warnings

---

## 🔮 Future Improvements

Possible future additions include:

- 🌍 Multi-language support
- 📲 Progressive Web App (PWA) support
- 🔔 Weather alerts and notifications
- 🗺️ Interactive map-based location selection
- 📈 Additional weather charts and visualizations

---

## 👩‍💻 Developer

**Özge Altunyuva**

Computer Engineering Student

---

<div align="center">

### ☁️ Weather information, made simple.

Built with React + TypeScript

</div>