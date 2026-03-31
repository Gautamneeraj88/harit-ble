# Development Tips & Best Practices

## 🎨 Styling with Nativewind

### Using Tailwind Classes
```tsx
// ✅ Good
<View className="flex-1 bg-bg-dark p-4" />

// ❌ Avoid mixing with inline styles when possible
<View className="flex-1" style={{ backgroundColor: '#090A0F' }} />
```

### Custom Colors
All design system colors are available:
- `bg-bg-dark` - Background (#090A0F)
- `bg-surface` - Cards (#12151F)
- `text-primary` - Primary cyan (#00E5FF)
- `text-good` - Success green (#00FF66)
- `text-warn` - Warning yellow (#FFB300)
- `text-critical` - Error red (#FF2A2A)

### Typography
```tsx
<Text className="font-display">Space Grotesk</Text>
<Text className="font-body">Manrope</Text>
<Text className="font-mono">JetBrains Mono</Text>
```

## 🔧 Component Patterns

### Reusable Telemetry Card
```tsx
import { TelemetryCard } from '@/components/TelemetryCard';

<TelemetryCard
  icon={<Thermometer size={20} />}
  label="Temperature"
  value="24.5°C"
  progress={65}
  progressColor="#00FF66"
/>
```

### Radar Animation
```tsx
import { Radar } from '@/components/Radar';

<Radar isScanning={isScanning} size={256} />
```

### Live Indicator
```tsx
import { LiveIndicator } from '@/components/LiveIndicator';

<LiveIndicator label="Live Monitoring" color="#00F0FF" />
```

## 📊 State Management

### BLE Connection State
```tsx
const { isConnected, connectedPeripheralId, startScan, connect } = useBLE();
```

### Sensor Data
```tsx
const [reading, setReading] = useState<SensorReading | null>(null);
```

### Loading States
```tsx
const [loading, setLoading] = useState(false);

{loading ? <Loader2 /> : <CheckCircle />}
```

## 🎭 Animations

### Pulse Animation
```tsx
const pulseAnim = useRef(new Animated.Value(1)).current;

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.5,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, [pulseAnim]);

<Animated.View style={{ opacity: pulseAnim }} />
```

### Rotation
```tsx
const rotateAnim = useRef(new Animated.Value(0)).current;

Animated.loop(
  Animated.timing(rotateAnim, {
    toValue: 1,
    duration: 3000,
    easing: Easing.linear,
    useNativeDriver: true,
  })
).start();

const rotation = rotateAnim.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '360deg'],
});
```

## 🔌 BLE Integration

### Starting a Scan
```tsx
const { startScan, discoveredDevices } = useBLE();

// Scan for 15 seconds
startScan(15);
```

### Connecting to Device
```tsx
const success = await connect(peripheral.id);
if (success) {
  router.push('/provision');
}
```

### Sending WiFi Credentials
```tsx
const result = await sendWifiCredentials(ssid, password);
```

### Reading Sensor Data
```tsx
// Via BLE notifications
GrainService.startSensorNotifications(peripheralId);

// Or one-time read
const data = await GrainService.readSensorData(peripheralId);
```

## 🎯 Performance Tips

### 1. Use useCallback for Event Handlers
```tsx
const handlePress = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### 2. Memoize Expensive Calculations
```tsx
const scoreColor = useMemo(() => getScoreColor(score), [score]);
```

### 3. Optimize FlatList
```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

### 4. Use Native Driver for Animations
```tsx
Animated.timing(value, {
  useNativeDriver: true, // ✅ Always use this
})
```

## 🐛 Debugging

### View Layout Issues
```tsx
// Add borders to debug layout
<View className="border border-red-500" />
```

### Log BLE Events
```tsx
bleEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', (data) => {
  console.log('BLE Data:', data);
});
```

### Check State Updates
```tsx
useEffect(() => {
  console.log('State changed:', { reading, dataSource });
}, [reading, dataSource]);
```

## 📦 Code Organization

```
app/
├── (tabs)/          # Tab screens
├── scanner.tsx      # Standalone screens
├── dashboard.tsx
├── provision.tsx
└── settings.tsx

components/
├── TelemetryCard.tsx
├── Radar.tsx
└── LiveIndicator.tsx

lib/
└── utils.ts         # Helper functions

services/
├── bleManager.ts    # BLE service
└── GrainService.ts  # Sensor data service

hooks/
├── useBLE.ts        # BLE hook
└── useProDarkFonts.ts
```

## 🎨 Design Guidelines

### Spacing
- Small: `gap-2` (8px)
- Medium: `gap-4` (16px)
- Large: `gap-6` (24px)

### Border Radius
Always use `style={{ borderRadius: 2 }}` for the pro aesthetic

### Glow Effects
```tsx
style={{
  textShadowColor: 'rgba(0, 240, 255, 0.4)',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 10,
}}
```

### Icons
- Use Lucide React Native
- Standard size: 20-24px
- Large: 40-60px for empty states

## 🚀 Deployment

### Building for Production

**iOS:**
```bash
eas build --platform ios
```

**Android:**
```bash
eas build --platform android
```

### Testing Before Deploy
1. Run on physical devices
2. Test BLE connectivity
3. Verify all navigation flows
4. Check animations performance
5. Test with actual sensor hardware

---

Happy building! 🎉
