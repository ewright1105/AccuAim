import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { useNavigation, useRouter } from "expo-router";
import { useAuth } from "./AuthContext";
import { useRoute } from "@react-navigation/native";

// NEW: Import BLE Manager and related types
import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
// NEW: Import Buffer for decoding BLE data
import { Buffer } from 'buffer';

// --- BLE Constants (these MUST match your ESP32 code) ---
const SENSOR_SERVICE_UUID = "bb8a0b11-545b-4d9e-9485-db89bea05d09";
const SENSOR_CHARACTERISTIC_UUID = "204e46ad-df66-4989-aec3-244c6c24f023";

// --- Main Component ---
export default function ActiveSession() {
  // Define the Shot interface
  interface Shot {
    ShotID: number;
    BlockID: number;
    ShotTime: string;
    ShotPositionX: string;
    ShotPositionY: string;
    Result: "Made" | "Missed";
  }

  // --- Existing Hooks and State ---
  const route = useRoute();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { SessionID } = route.params as { SessionID: number };
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // For initial session data
  const [shots, setShots] = useState<Shot[] | null>(null);

  // --- NEW: BLE State ---
  // Use useRef to hold the BleManager instance, preventing re-creation on re-renders
  const bleManager = useRef(new BleManager()).current;
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDevices, setScannedDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [lastImpactCount, setLastImpactCount] = useState(0);

  // --- Lifecycle and Cleanup Effect ---
  useEffect(() => {
    // Fetch initial session data when the component mounts
    if (user && SessionID) {
      fetchSessionData(Number(user.UserID), SessionID);
    } else {
      setError("User not logged in or invalid session ID.");
      setLoading(false);
    }

    // This is the cleanup function that runs when the component unmounts
    return () => {
      console.log("Unmounting ActiveSession: cleaning up BLE connections.");
      bleManager.stopDeviceScan(); // Stop any active scan
      bleManager.destroy(); // Release all BLE resources
    };
  }, [bleManager, user, SessionID]);

  // --- Set Navigation Options ---
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "You are in a Shooting Session",
    });
  }, [navigation]);

  // --- Existing Data Fetching Functions ---
  const fetchSessionData = async (userId: number, sessionId: number) => {
    try {
      setLoading(true);
      const apiUrl = `http://172.31.0.87:4949/user/${userId}/sessions/${sessionId}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch session data.");
      const data: Shot[] = await response.json();
      setShots(data);
    } catch (err) {
      console.error("Error fetching session data:", err);
      setError("Error fetching session data.");
    } finally {
      setLoading(false);
    }
  };

  const recordShot = async () => {
    if (!user || !SessionID) {
        console.error("Cannot record shot: User or SessionID is missing.");
        return;
    }
    console.log("Attempting to record a new shot via API...");
    try {
        const apiUrl = `http://172.31.0.87:4949/user/${user.UserID}/sessions/${SessionID}/shots`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ShotPositionX: "0", ShotPositionY: "0", Result: "Made" }),
        });

        if (!response.ok) throw new Error(`Failed to record shot: ${response.statusText}`);
        
        console.log("Shot recorded successfully!");
        // Re-fetch all shots to update the UI
        await fetchSessionData(Number(user.UserID), SessionID);
    } catch (err) {
        console.error("Error recording shot:", err);
        Alert.alert("API Error", "Could not record the new shot.");
    }
  };

  // --- NEW: BLE Functions ---
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        const allPermissionsGranted =
            granted['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
            granted['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
            granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted';
        
        if (!allPermissionsGranted) {
            Alert.alert("Permission Error", "Bluetooth and Location permissions are required to scan for devices.");
        }
        return allPermissionsGranted;
    }
    return true; // For iOS, permissions are handled in Info.plist
  };

  const scanForDevices = async () => {
    const permissionsGranted = await requestPermissions();
    if (!permissionsGranted) return;

    setScannedDevices([]);
    setIsScanning(true);
    console.log("Scanning for devices...");

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("Scan Error:", error);
        setError("Error while scanning for devices.");
        setIsScanning(false);
        return;
      }
      if (device && device.name) {
        setScannedDevices(prevDevices => {
          if (!prevDevices.find(d => d.id === device.id)) {
            console.log("Found device:", device.name, device.id);
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    // Stop scanning after 10 seconds to save battery
    setTimeout(() => {
        if (isScanning) {
            bleManager.stopDeviceScan();
            setIsScanning(false);
            console.log("Scan stopped.");
        }
    }, 10000);
  };

  const connectToDevice = async (device: Device) => {
    try {
      console.log(`Connecting to ${device.name}...`);
      bleManager.stopDeviceScan();
      setIsScanning(false);

      const connectedDeviceInstance = await device.connect();
      setConnectedDevice(connectedDeviceInstance);
      console.log("Connection successful. Discovering services...");
      
      await connectedDeviceInstance.discoverAllServicesAndCharacteristics();
      console.log("Services and characteristics discovered.");

      // Set up the listener for notifications
      connectedDeviceInstance.monitorCharacteristicForService(
        SENSOR_SERVICE_UUID,
        SENSOR_CHARACTERISTIC_UUID,
        onImpactCountUpdate, // The callback function
      );
      console.log(`Subscribed to notifications on ${device.name}.`);
    } catch (e) {
      console.error(`Failed to connect or subscribe to ${device.name}`, e);
      Alert.alert("Connection Failed", `Could not connect to ${device.name}. Please try again.`);
    }
  };

  // This is the callback function that runs every time the ESP32 sends new data
  const onImpactCountUpdate = (error: any, characteristic: Characteristic | null) => {
    if (error) {
      console.error("BLE Notification Error:", error.message);
      return;
    }
    if (!characteristic?.value) {
      console.error("Characteristic value is null");
      return;
    }

    // The data arrives as a Base64 string. We need to decode it.
    const rawData = Buffer.from(characteristic.value, 'base64');
    // The ESP32 sends the integer as a 32-bit little-endian number.
    const newCount = rawData.readInt32LE(0);
    
    // Core Logic: Only trigger the API call when the count INCREASES.
    if (newCount > lastImpactCount) {
      console.log(`New impact detected! Count changed from ${lastImpactCount} to ${newCount}.`);
      recordShot(); // <<< THIS TRIGGERS YOUR API CALL
    }
    // Always update the last known count to prepare for the next message.
    setLastImpactCount(newCount);
  };

  // --- UI Rendering ---
  const renderDeviceItem = ({ item }: { item: Device }) => (
    <TouchableOpacity onPress={() => connectToDevice(item)} style={styles.deviceButton}>
      <Text style={styles.deviceText}>{item.name || 'Unnamed Device'}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#F1C40F" />
        <Text style={styles.subtitle}>Loading Session...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!connectedDevice ? (
        // --- UI for when NOT connected ---
        <View style={styles.connectionContainer}>
          <Text style={styles.subtitle}>Connect to AccuAim Sensor</Text>
          <TouchableOpacity style={styles.button} onPress={scanForDevices} disabled={isScanning}>
            <Text style={styles.buttonText}>{isScanning ? 'Scanning...' : 'Scan for Devices'}</Text>
          </TouchableOpacity>
          {isScanning && <ActivityIndicator size="large" color="#F1C40F" style={{ marginVertical: 20 }} />}
          <FlatList
            data={scannedDevices}
            renderItem={renderDeviceItem}
            keyExtractor={item => item.id}
            style={styles.deviceList}
          />
        </View>
      ) : (
        // --- UI for when CONNECTED ---
        <View style={styles.connectionContainer}>
          <Text style={styles.connectedText}>✓ Connected to {connectedDevice.name}</Text>
        </View>
      )}

      {/* --- Main App UI --- */}
      <Image
        source={require("/Users/evanwright/personal-projects/AccuAim/AccuAimApp/assets/images/Screenshot 2024-12-30 at 6.45.08 PM.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.subtitle}>Total Shots Recorded: {shots ? shots.length : 0}</Text>
      <TouchableOpacity
        style={styles.endButton}
        onPress={async () => { /* Your end session logic */ router.push("/LandingScreen"); }}
      >
        <Text style={styles.buttonText}>End Session</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#F1C40F",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: "#B0B0B0",
    textAlign: 'center',
  },
  button: {
    backgroundColor: "#2980b9",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  endButton: {
    backgroundColor: "#c0392b",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  connectionContainer: {
    width: '100%',
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
  },
  connectedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  deviceList: {
    width: '100%',
    marginTop: 20,
    maxHeight: 200,
  },
  deviceButton: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#34495e',
    borderRadius: 5,
  },
  deviceText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});