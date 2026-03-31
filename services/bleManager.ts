import { NativeEventEmitter, NativeModules } from 'react-native';
import BleManager from 'react-native-ble-manager';

export const bleManagerModule = NativeModules.BleManager;
export const bleEmitter = new NativeEventEmitter(bleManagerModule);

let isInitialized = false;

export const initBleManager = async (): Promise<void> => {
  if (isInitialized) return;
  await BleManager.start({ showAlert: false, forceLegacy: true });
  isInitialized = true;
};

export { BleManager };
