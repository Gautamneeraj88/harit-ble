import {
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
} from '@expo-google-fonts/manrope';
import {
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';

export function useProDarkFonts() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  return fontsLoaded;
}
