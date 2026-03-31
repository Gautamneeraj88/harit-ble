import BleManager from 'react-native-ble-manager';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const SSID_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const PASS_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';
const SENSOR_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26aa';

// Change to your Mac's IP
const API_URL = 'http://192.168.1.105:3000/api/readings';

export interface SensorReading {
  temperature: number;
  humidity: number;
  grainMoisture: number;
  gasLevel: number;
  totalScore: number;
  result: string;
}

// In-memory connected peripheral ID
let connectedPeripheralId: string | null = null;

// Convert string to byte array for BLE write
const stringToBytes = (str: string): number[] => {
  return Array.from(str).map((char) => char.charCodeAt(0));
};

// Parse sensor data from BLE characteristic bytes
const parseSensorData = (data: number[]): SensorReading | null => {
  try {
    const jsonStr = String.fromCharCode(...data);
    return JSON.parse(jsonStr) as SensorReading;
  } catch {
    return null;
  }
};

export const GrainService = {
  setConnectedPeripheral: (peripheralId: string) => {
    connectedPeripheralId = peripheralId;
  },

  getConnectedPeripheral: (): string | null => {
    return connectedPeripheralId;
  },

  clearConnectedPeripheral: () => {
    connectedPeripheralId = null;
  },

  // BLE: Send WiFi credentials to ESP32
  sendWifi: async (peripheralId: string, ssid: string, pass: string): Promise<boolean> => {
    try {
      await BleManager.retrieveServices(peripheralId);

      // Write SSID
      await BleManager.write(peripheralId, SERVICE_UUID, SSID_CHAR_UUID, stringToBytes(ssid));

      // Write Password
      await BleManager.write(peripheralId, SERVICE_UUID, PASS_CHAR_UUID, stringToBytes(pass));

      return true;
    } catch (error) {
      console.error('BLE Write Error:', error);
      return false;
    }
  },

  // BLE: Read sensor data directly from device
  readSensorData: async (peripheralId: string): Promise<SensorReading | null> => {
    try {
      await BleManager.retrieveServices(peripheralId);
      const data = await BleManager.read(peripheralId, SERVICE_UUID, SENSOR_CHAR_UUID);
      return parseSensorData(data);
    } catch (error) {
      console.error('BLE Read Error:', error);
      return null;
    }
  },

  // BLE: Start notifications for sensor data
  startSensorNotifications: async (peripheralId: string): Promise<boolean> => {
    try {
      await BleManager.retrieveServices(peripheralId);
      await BleManager.startNotification(peripheralId, SERVICE_UUID, SENSOR_CHAR_UUID);
      return true;
    } catch (error) {
      console.error('BLE Notification Error:', error);
      return false;
    }
  },

  // BLE: Stop notifications
  stopSensorNotifications: async (peripheralId: string): Promise<void> => {
    try {
      await BleManager.stopNotification(peripheralId, SERVICE_UUID, SENSOR_CHAR_UUID);
    } catch {
      // Ignore errors on stop
    }
  },

  // BLE: Disconnect from device
  disconnect: async (peripheralId: string): Promise<void> => {
    try {
      await BleManager.disconnect(peripheralId);
    } catch {
      // Ignore disconnect errors
    }
    if (connectedPeripheralId === peripheralId) {
      connectedPeripheralId = null;
    }
  },

  // HTTP: Fetch latest from Node.js backend
  getLatestReading: async (): Promise<SensorReading | null> => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      return data[0] ?? null;
    } catch {
      return null;
    }
  },

  // Parse sensor data from BLE notification bytes
  parseSensorData,

  // Constants for external use
  SERVICE_UUID,
  SENSOR_CHAR_UUID,
};
