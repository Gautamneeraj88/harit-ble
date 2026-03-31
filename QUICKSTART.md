# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

### 3. Run on Device/Simulator

**iOS:**
```bash
# Press 'i' in terminal, or
npm run ios
```

**Android:**
```bash
# Press 'a' in terminal, or
npm run android
```

## 📱 Testing the App

### Without Hardware (Demo Mode)

The app has HTTP fallback, so you can test the dashboard even without BLE devices:

1. Navigate to **Dashboard** from home screen
2. The app will show "AWAITING TELEMETRY..."
3. Tap "Request Data" to trigger HTTP fetch

### With BLE Hardware

1. Ensure Bluetooth is enabled on your device
2. Put your grain sensor in pairing mode
3. Tap "Setup New Device" on home screen
4. Select your device from the scanner
5. Enter WiFi credentials
6. View live telemetry on dashboard

## 🎨 Customization

### Change Primary Color

Edit `tailwind.config.js`:
```js
colors: {
  primary: '#FF00FF', // Your color here
}
```

### Adjust Polling Interval

Edit `app/dashboard.tsx`:
```ts
httpIntervalRef.current = setInterval(fetchHttp, 3000); // 3 seconds
```

### Modify BLE UUIDs

Edit `services/GrainService.ts`:
```ts
static GRAIN_SERVICE_UUID = 'your-uuid-here';
```

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --clear
```

### Font Not Loading
```bash
# Clear cache and rebuild
rm -rf node_modules
npm install
npm start -- --reset-cache
```

### Android BLE Not Working
1. Enable location services
2. Grant location permission
3. Check Bluetooth is on

### iOS Build Errors
```bash
# Clean iOS build
cd ios && pod install && cd ..
npm run ios
```

## 📖 Learn More

- **Expo Docs:** https://docs.expo.dev
- **Nativewind:** https://www.nativewind.dev
- **React Native BLE:** https://github.com/innoveit/react-native-ble-manager

## 🎯 Next Steps

- [ ] Test on physical device for BLE
- [ ] Add your actual sensor UUIDs
- [ ] Customize colors to match your brand
- [ ] Implement Analytics screen
- [ ] Add data export functionality

Happy coding! 🚀
