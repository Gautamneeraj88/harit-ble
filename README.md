# Pro Dark Mode - Grain Quality Monitor

A premium hardware-companion app for monitoring grain quality in real-time with a sleek, technical dark mode interface.

## 🎨 Design System

### Color Palette
- **Primary:** `#00E5FF` - Cyan neon (Buttons, active tabs, radar sweeps)
- **Background:** `#090A0F` - Deep void navy
- **Surface:** `#12151F` - Cards, elevated containers
- **Text:** `#F1F5F9` - Primary body text
- **Muted:** `#64748B` - Subtitles, inactive icons
- **Good:** `#00FF66` - Optimal grain score
- **Warning:** `#FFB300` - Marginal grain score
- **Critical:** `#FF2A2A` - Danger grain score

### Typography
- **Headings:** Space Grotesk, 700, 24-32px
- **Body:** Manrope, 500, 16px
- **Data Readouts:** JetBrains Mono, 400-700, 20-40px
- **Buttons:** Space Grotesk, 700, 15px, uppercase tracking 1px

## 📱 Screens

1. **Device Discovery** - Radar animation with BLE device scanning
2. **WiFi Provisioning** - Network credential transmission
3. **Live Dashboard** - Real-time telemetry with dynamic scoring
4. **Node Settings** - Hardware diagnostics and controls

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 🏗️ Tech Stack

- React Native (Expo)
- Nativewind (Tailwind CSS)
- Expo Router
- Lucide React Native
- react-native-ble-manager
- Google Fonts

## 📂 Project Structure

```
app/
├── (tabs)/          # Tab navigation
├── scanner.tsx      # Device Discovery
├── provision.tsx    # WiFi Setup
├── dashboard.tsx    # Live Dashboard
└── settings.tsx     # Node Settings
```

## 🎯 Key Features

- **Animated Radar Scan** - Rotating sweep visualization
- **Real-time Data** - 5-second polling with pulse animations
- **BLE Provisioning** - Send WiFi credentials to hardware
- **Dynamic Scoring** - Color-coded quality metrics (0-100)
- **Pro Dark UI** - Technical aesthetic with glowing accents

Built with ❤️ using Expo, React Native, and Nativewind
