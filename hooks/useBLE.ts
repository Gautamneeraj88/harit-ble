import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import BleManager, { Peripheral } from 'react-native-ble-manager';

import { bleEmitter, initBleManager } from '@/services/bleManager';
import { GrainService } from '@/services/GrainService';

const LOG_TAG = '[BLE]';

export type BluetoothState = 'on' | 'off' | 'unknown' | 'unsupported';

export interface UseBLEState {
  isScanning: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  connectedPeripheralId: string | null;
  discoveredDevices: Peripheral[];
  bluetoothState: BluetoothState;
  error: string | null;
  filterGrainQuality: boolean;
}

export interface UseBLEActions {
  requestPermissions: () => Promise<boolean>;
  startScan: (seconds?: number) => void;
  stopScan: () => void;
  connect: (peripheralId: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  sendWifiCredentials: (ssid: string, pass: string) => Promise<boolean>;
  setFilterGrainQuality: (enabled: boolean) => void;
  clearError: () => void;
}

export function useBLE(): UseBLEState & UseBLEActions {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPeripheralId, setConnectedPeripheralId] = useState<string | null>(null);
  const [discoveredDevices, setDiscoveredDevices] = useState<Peripheral[]>([]);
  const [bluetoothState, setBluetoothState] = useState<BluetoothState>('unknown');
  const [error, setError] = useState<string | null>(null);
  const [filterGrainQuality, setFilterGrainQuality] = useState(true);

  const isInitialized = useRef(false);
  const allDiscoveredDevices = useRef<Map<string, Peripheral>>(new Map());

  // Initialize BLE Manager
  useEffect(() => {
    const init = async () => {
      if (isInitialized.current) return;
      console.log(LOG_TAG, 'Initializing BLE Manager...');
      try {
        await initBleManager();
        isInitialized.current = true;
        console.log(LOG_TAG, 'BLE Manager initialized successfully');

        // Check initial state
        const state = await BleManager.checkState();
        const mappedState = mapBluetoothState(state);
        console.log(LOG_TAG, 'Initial Bluetooth state:', state, '→', mappedState);
        setBluetoothState(mappedState);
      } catch (err) {
        setError('Failed to initialize Bluetooth');
        console.error(LOG_TAG, 'Init Error:', err);
      }
    };

    init();
  }, []);

  // Set up event listeners
  useEffect(() => {
    const handleDiscoverPeripheral = (peripheral: Peripheral) => {
      if (!peripheral.id) return;
      console.log(LOG_TAG, 'Discovered:', peripheral.name || 'Unknown', `(${peripheral.id})`, 'RSSI:', peripheral.rssi);

      allDiscoveredDevices.current.set(peripheral.id, peripheral);
      updateFilteredDevices();
    };

    const handleStopScan = () => {
      console.log(LOG_TAG, 'Scan stopped. Total devices found:', allDiscoveredDevices.current.size);
      setIsScanning(false);
    };

    const handleConnectPeripheral = (data: { peripheral: string }) => {
      console.log(LOG_TAG, 'Connected to peripheral:', data.peripheral);
      setIsConnected(true);
      setConnectedPeripheralId(data.peripheral);
      GrainService.setConnectedPeripheral(data.peripheral);
    };

    const handleDisconnectPeripheral = (data: { peripheral: string }) => {
      console.log(LOG_TAG, 'Disconnected from peripheral:', data.peripheral);
      if (connectedPeripheralId === data.peripheral) {
        setIsConnected(false);
        setConnectedPeripheralId(null);
        GrainService.clearConnectedPeripheral();
      }
    };

    const handleUpdateState = (args: { state: string }) => {
      const mappedState = mapBluetoothState(args.state);
      console.log(LOG_TAG, 'Bluetooth state changed:', args.state, '→', mappedState);
      setBluetoothState(mappedState);
    };

    console.log(LOG_TAG, 'Setting up BLE event listeners');
    const listeners = [
      bleEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral),
      bleEmitter.addListener('BleManagerStopScan', handleStopScan),
      bleEmitter.addListener('BleManagerConnectPeripheral', handleConnectPeripheral),
      bleEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectPeripheral),
      bleEmitter.addListener('BleManagerDidUpdateState', handleUpdateState),
    ];

    return () => {
      console.log(LOG_TAG, 'Removing BLE event listeners');
      listeners.forEach((listener) => listener.remove());
    };
  }, [connectedPeripheralId]);

  // Update filtered devices when filter changes
  const updateFilteredDevices = useCallback(() => {
    const devices = Array.from(allDiscoveredDevices.current.values());
    if (filterGrainQuality) {
      const filtered = devices.filter(
        (d) => d.name === 'GrainQuality' || d.advertising?.localName === 'GrainQuality'
      );
      console.log(LOG_TAG, 'Filtered devices (GrainQuality only):', filtered.length);
      setDiscoveredDevices(filtered);
    } else {
      console.log(LOG_TAG, 'Showing all devices:', devices.length);
      setDiscoveredDevices(devices);
    }
  }, [filterGrainQuality]);

  useEffect(() => {
    updateFilteredDevices();
  }, [filterGrainQuality, updateFilteredDevices]);

  // Request Bluetooth permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    console.log(LOG_TAG, 'Requesting permissions. Platform:', Platform.OS, 'Version:', Platform.Version);

    if (Platform.OS === 'ios') {
      console.log(LOG_TAG, 'iOS: Permissions handled via Info.plist');
      return true;
    }

    try {
      const apiLevel = Platform.Version as number;

      if (apiLevel >= 31) {
        console.log(LOG_TAG, 'Android 12+: Requesting BLUETOOTH_SCAN and BLUETOOTH_CONNECT');
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);

        console.log(LOG_TAG, 'Permission results:', results);

        const allGranted = Object.values(results).every(
          (result) => result === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          console.warn(LOG_TAG, 'Permissions denied');
          setError('Bluetooth permissions are required');
          return false;
        }
      } else {
        console.log(LOG_TAG, 'Android <12: Requesting ACCESS_FINE_LOCATION');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        console.log(LOG_TAG, 'Location permission result:', granted);

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn(LOG_TAG, 'Location permission denied');
          setError('Location permission is required for Bluetooth scanning');
          return false;
        }
      }

      console.log(LOG_TAG, 'All permissions granted');
      return true;
    } catch (err) {
      setError('Failed to request permissions');
      console.error(LOG_TAG, 'Permission Error:', err);
      return false;
    }
  }, []);

  // Start BLE scan
  const startScan = useCallback(
    (seconds: number = 10) => {
      console.log(LOG_TAG, 'startScan called. isScanning:', isScanning, 'bluetoothState:', bluetoothState);

      if (isScanning) {
        console.log(LOG_TAG, 'Already scanning, ignoring');
        return;
      }
      if (bluetoothState !== 'on') {
        console.warn(LOG_TAG, 'Bluetooth not enabled, cannot scan');
        setError('Bluetooth is not enabled');
        return;
      }

      console.log(LOG_TAG, 'Starting scan for', seconds, 'seconds...');
      setError(null);
      allDiscoveredDevices.current.clear();
      setDiscoveredDevices([]);
      setIsScanning(true);

      BleManager.scan({ seconds, allowDuplicates: false })
        .then(() => {
          console.log(LOG_TAG, 'Scan started successfully');
        })
        .catch((err) => {
          setIsScanning(false);
          setError('Failed to start scan');
          console.error(LOG_TAG, 'Scan Error:', err);
        });
    },
    [isScanning, bluetoothState]
  );

  // Stop BLE scan
  const stopScan = useCallback(() => {
    console.log(LOG_TAG, 'Stopping scan...');
    BleManager.stopScan()
      .then(() => {
        console.log(LOG_TAG, 'Scan stopped manually');
        setIsScanning(false);
      })
      .catch((err) => {
        console.error(LOG_TAG, 'Stop Scan Error:', err);
      });
  }, []);

  // Connect to a peripheral
  const connect = useCallback(async (peripheralId: string): Promise<boolean> => {
    console.log(LOG_TAG, 'Connecting to peripheral:', peripheralId);
    setIsConnecting(true);
    setError(null);

    try {
      console.log(LOG_TAG, 'Calling BleManager.connect...');
      await BleManager.connect(peripheralId);
      console.log(LOG_TAG, 'Connected. Retrieving services...');
      await BleManager.retrieveServices(peripheralId);
      console.log(LOG_TAG, 'Services retrieved successfully');

      setIsConnected(true);
      setConnectedPeripheralId(peripheralId);
      GrainService.setConnectedPeripheral(peripheralId);

      console.log(LOG_TAG, 'Connection complete');
      return true;
    } catch (err) {
      setError('Failed to connect to device');
      console.error(LOG_TAG, 'Connect Error:', err);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect from current peripheral
  const disconnect = useCallback(async (): Promise<void> => {
    console.log(LOG_TAG, 'Disconnecting from:', connectedPeripheralId);
    if (!connectedPeripheralId) {
      console.log(LOG_TAG, 'No peripheral connected, nothing to disconnect');
      return;
    }

    try {
      await GrainService.disconnect(connectedPeripheralId);
      console.log(LOG_TAG, 'Disconnected successfully');
    } catch (err) {
      console.warn(LOG_TAG, 'Disconnect error (ignored):', err);
    }

    setIsConnected(false);
    setConnectedPeripheralId(null);
  }, [connectedPeripheralId]);

  // Send WiFi credentials to connected device
  const sendWifiCredentials = useCallback(
    async (ssid: string, pass: string): Promise<boolean> => {
      console.log(LOG_TAG, 'Sending WiFi credentials. SSID:', ssid, 'Connected to:', connectedPeripheralId);

      if (!connectedPeripheralId) {
        console.warn(LOG_TAG, 'No device connected');
        setError('No device connected');
        return false;
      }

      try {
        console.log(LOG_TAG, 'Writing SSID and password to device...');
        const success = await GrainService.sendWifi(connectedPeripheralId, ssid, pass);
        if (success) {
          console.log(LOG_TAG, 'WiFi credentials sent successfully');
        } else {
          console.warn(LOG_TAG, 'sendWifi returned false');
          setError('Failed to send credentials');
        }
        return success;
      } catch (err) {
        setError('Failed to send credentials');
        console.error(LOG_TAG, 'Send WiFi Error:', err);
        return false;
      }
    },
    [connectedPeripheralId]
  );

  const clearError = useCallback(() => {
    console.log(LOG_TAG, 'Clearing error');
    setError(null);
  }, []);

  return {
    // State
    isScanning,
    isConnecting,
    isConnected,
    connectedPeripheralId,
    discoveredDevices,
    bluetoothState,
    error,
    filterGrainQuality,
    // Actions
    requestPermissions,
    startScan,
    stopScan,
    connect,
    disconnect,
    sendWifiCredentials,
    setFilterGrainQuality,
    clearError,
  };
}

function mapBluetoothState(state: string): BluetoothState {
  switch (state) {
    case 'on':
    case 'PoweredOn':
      return 'on';
    case 'off':
    case 'PoweredOff':
      return 'off';
    case 'unsupported':
      return 'unsupported';
    default:
      return 'unknown';
  }
}
