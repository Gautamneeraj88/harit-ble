#!/bin/bash

echo "🔍 Checking Pro Dark Mode Setup..."
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
  echo "✅ Dependencies installed"
else
  echo "❌ Dependencies not installed. Run: npm install"
  exit 1
fi

# Check key files exist
files=(
  "tailwind.config.js"
  "global.css"
  "babel.config.js"
  "metro.config.js"
  "nativewind-env.d.ts"
  "app/scanner.tsx"
  "app/provision.tsx"
  "app/dashboard.tsx"
  "app/settings.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ Missing: $file"
  fi
done

# Check components
components=(
  "components/TelemetryCard.tsx"
  "components/Radar.tsx"
  "components/LiveIndicator.tsx"
)

echo ""
echo "📦 Checking components..."
for comp in "${components[@]}"; do
  if [ -f "$comp" ]; then
    echo "✅ $comp"
  else
    echo "⚠️  Optional: $comp (not critical)"
  fi
done

echo ""
echo "🎨 Design System Check:"
if grep -q "primary.*#00E5FF" tailwind.config.js; then
  echo "✅ Primary color configured (#00E5FF)"
else
  echo "❌ Primary color not configured"
fi

if grep -q "Space Grotesk" hooks/useProDarkFonts.ts 2>/dev/null; then
  echo "✅ Fonts configured"
else
  echo "⚠️  Font hook not found"
fi

echo ""
echo "📱 Ready to run:"
echo "   npm start      - Start development server"
echo "   npm run ios    - Run on iOS"
echo "   npm run android - Run on Android"
echo ""
echo "✨ Pro Dark Mode setup complete!"
