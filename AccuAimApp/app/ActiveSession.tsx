import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  PermissionsAndroid,
} from 'react-native';
import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { Buffer } from 'buffer'; // Import Buffer for decoding

// These UUIDs must match the ones on your ESP32
const SERVICE_UUID = "bb8a0b11-545b-4d9e-9485-db89bea05d09";
const CHARACTERISTIC_UUID = "204e46ad-df66-4989-aec3-244c6c24f023";

const bleManager = new BleManager();

type ConnectionStatus = 'Disconnected' | 'Scanning' | 'Connecting' | 'Connected';

export default function ActiveSession() {
  const [device, setDevice] = useState<Device | null>(null);
  const [impactCount, setImpactCount] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Disconnected');
  const subscriptionRef = useRef<Subscription | null>(null);

  // Request Android permissions
  useEffect(() => {
    if (Platform.OS === 'android') {
      const requestPermissions = async () => {
        const res = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        console.log('Permissions result:', res);
      };
      requestPermissions();
    }
  }, []);

  // Handle device disconnection
  useEffect(() => {
    if (device) {
      const subscription = bleManager.onDeviceDisconnected(device.id, (error, disconnectedDevice) => {
        console.log(`Device ${disconnectedDevice?.name} disconnected`, error);
        setConnectionStatus('Disconnected');
        setDevice(null);
        subscriptionRef.current?.remove();
      });
      return () => subscription.remove();
    }
  }, [device]);


  const scanForDevices = () => {
    setConnectionStatus('Scanning');
    bleManager.startDeviceScan([SERVICE_UUID], null, (error, scannedDevice) => {
      if (error) {
        console.error("Scan Error:", error);
        setConnectionStatus('Disconnected');
        return;
      }
      if (scannedDevice && scannedDevice.name === 'AccuAim Sensor') {
        bleManager.stopDeviceScan();
        setConnectionStatus('Connecting');
        connectToDevice(scannedDevice);
      }
    });
  };

  const connectToDevice = async (deviceToConnect: Device) => {
    try {
      const connectedDevice = await deviceToConnect.connect();
      setDevice(connectedDevice);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      setConnectionStatus('Connected');
      console.log('Connection successful!');

      // Subscribe to notifications
      subscriptionRef.current = connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error("Monitor Error:", error);
            return;
          }
          if (characteristic?.value) {
            // The value is Base64 encoded. We need to decode it.
            // Your ESP32 sends an `int`, which is typically 4 bytes.
            const rawValue = Buffer.from(characteristic.value, 'base64');
            const newCount = rawValue.readInt32LE(0); // Read as a 32-bit little-endian integer
            setImpactCount(newCount);
          }
        }
      );

    } catch (e) {
      console.error("Connection failed:", e);
      setConnectionStatus('Disconnected');
    }
  };

  const disconnectFromDevice = () => {
    if (device) {
      subscriptionRef.current?.remove();
      device.cancelConnection();
      console.log('Disconnected');
    }
  };

  const handlePress = () => {
    if (device) {
      disconnectFromDevice();
    } else {
      scanForDevices();
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'Connected': return '#4CAF50';
      case 'Scanning':
      case 'Connecting': return '#FFC107';
      default: return '#607D8B';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>AccuAim Sensor</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Status:</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{connectionStatus}</Text>
        </View>

        <View style={styles.counterContainer}>
          <Text style={styles.counterLabel}>Impacts</Text>
          <Text style={styles.counterText}>{impactCount}</Text>
        </View>

        <TouchableOpacity style={styles.mainButton} onPress={handlePress}>
          <Text style={styles.buttonText}>
            {device ? 'Disconnect' : 'Scan for Sensor'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// (Styles are the same as the previous answer, you can copy them from there)
const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#1c1c1e',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
      flex: 1,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    header: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 20,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    statusText: {
      fontSize: 18,
      color: '#ccc',
      marginRight: 8,
    },
    statusIndicator: {
      width: 15,
      height: 15,
      borderRadius: 7.5,
      marginRight: 8,
    },
    counterContainer: {
      alignItems: 'center',
      marginVertical: 40,
      padding: 20,
      borderWidth: 2,
      borderColor: '#007AFF',
      borderRadius: 100,
      width: 200,
      height: 200,
      justifyContent: 'center',
    },
    counterLabel: {
      fontSize: 20,
      color: '#aaa',
    },
    counterText: {
      fontSize: 80,
      fontWeight: 'bold',
      color: '#fff',
    },
    mainButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 10,
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
  });
  