import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform,
  StatusBar, PermissionsAndroid, ActivityIndicator, Alert
} from 'react-native';
import { BleManager, Device, Subscription, BleError } from 'react-native-ble-plx'; 
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthContext';

const SERVICE_UUID = "bb8a0b11-545b-4d9e-9485-db89bea05d09";
const CHARACTERISTIC_UUID = "204e46ad-df66-4989-aec3-244c6c24f023";
const bleManager = new BleManager();
type ConnectionStatus = 'Disconnected' | 'Scanning' | 'Connecting' | 'Connected' | 'Error';
type BlockStat = {
  BlockID: number;
  TargetArea: string;
  ShotsPlanned: number;
  MadeShots: number;
  MissedShots: number;
};
type SessionData = {
  session_id: number;
  made_shots: number;
  missed_shots: number;
  total_shots: number;
  shooting_percentage: string;
  block_stats: BlockStat[];
};

export default function ActiveSession() {
  const { user } = useAuth();
  const router = useRouter();
  const { SessionID } = useLocalSearchParams();

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [device, setDevice] = useState<Device | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Disconnected');
  const subscriptionRef = useRef<Subscription | null>(null);
  const recordShotRef = useRef<() => void>(() => {});

  const isSessionComplete = useMemo(() => {
    if (!sessionData) return false;
    return currentBlockIndex >= sessionData.block_stats.length;
  }, [sessionData, currentBlockIndex]);
  
  const recordShot = async () => {
    if (isSessionComplete || !sessionData || !user) {
      return;
    }
    
    const currentBlock = sessionData.block_stats[currentBlockIndex];
    if (currentBlock.MadeShots >= currentBlock.ShotsPlanned) {
      return;
    }

    try {
      const response = await fetch(`http://172.20.10.6:4949/user/${user.UserID}/sessions/${SessionID}/active-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block_id: currentBlock.BlockID }),
      });
      if (response.ok) {
        setSessionData(prevData => {
          if (!prevData) return null;
          const newData = JSON.parse(JSON.stringify(prevData));
          const blockToUpdate = newData.block_stats[currentBlockIndex];
          blockToUpdate.MadeShots += 1;
          
          if (blockToUpdate.MadeShots >= blockToUpdate.ShotsPlanned) {
            const nextIndex = currentBlockIndex + 1;
            setCurrentBlockIndex(nextIndex);
            if (nextIndex >= newData.block_stats.length) {
              Alert.alert("Session Complete!", "All blocks are finished.");
            }
          }
          return newData;
        });
      } else { console.error("Failed to record shot on the server."); }
    } catch (error) { console.error("API error while recording shot:", error); }
  };
  
  useEffect(() => {
    recordShotRef.current = recordShot;
  }, [recordShot]);


  const connectToDevice = async (deviceToConnect: Device) => {
    try {
      const connectedDevice = await deviceToConnect.connect();
      setDevice(connectedDevice);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      setConnectionStatus('Connected');

      subscriptionRef.current = connectedDevice.monitorCharacteristicForService(
        SERVICE_UUID, CHARACTERISTIC_UUID, (error: BleError | null, characteristic) => {
          // --- THE FIX: Check for the specific cancellation error ---
          if (error) {
            // If the operation was cancelled, it's an expected part of the disconnect process.
            // We can safely ignore it and exit the function.
            if (error.message.includes('Operation was cancelled')) {
                return;
            }
            // For any other unexpected errors, we should still log them.
            console.error("Unexpected Monitor Error:", error);
            return;
          }
          // --- END FIX ---
          
          if (characteristic?.value) {
            recordShotRef.current();
          }
        }
      );
    } catch (e) { console.error("Connection failed:", e); setConnectionStatus('Error'); }
  };
  
  // --- All other functions (fetchSessionData, useEffects, handleFinishBlock, etc.) remain the same ---

  useEffect(() => {
    const fetchSessionData = async () => {
        if (!user || !SessionID) return;
        try {
          setIsLoading(true);
          const response = await fetch(`http://172.20.10.6:4949/user/${user.UserID}/sessions/${SessionID}`);
          if (!response.ok) throw new Error('Failed to fetch session data.');
          const data: SessionData = await response.json();
          setSessionData(data);
        } catch (error) {
          console.error(error);
          Alert.alert("Error", "Could not load session details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchSessionData();
  }, [user, SessionID]);

  useEffect(() => {
    if (Platform.OS === 'android') {
        PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
      }
  }, []);

  useEffect(() => {
    if (device) {
        const sub = bleManager.onDeviceDisconnected(device.id, (error, d) => {
          console.log(`Device ${d?.name} disconnected`, error);
          setConnectionStatus('Disconnected');
          setDevice(null);
          subscriptionRef.current?.remove();
        });
        return () => sub.remove();
      }
  }, [device]);

  const scanForDevices = () => {
    setConnectionStatus('Scanning');
    bleManager.startDeviceScan([SERVICE_UUID], null, (error, scannedDevice) => {
      if (error) {
        console.error("Scan Error:", error);
        setConnectionStatus('Error');
        return;
      }
      if (scannedDevice && scannedDevice.name === 'AccuAim Sensor') {
        bleManager.stopDeviceScan();
        setConnectionStatus('Connecting');
        connectToDevice(scannedDevice);
      }
    });
  };

  const disconnectFromDevice = () => {
    if (device) {
        subscriptionRef.current?.remove();
        device.cancelConnection();
      }
  };
  
  const handleFinishBlock = () => {
    if (isSessionComplete || !sessionData) return;
    const nextIndex = currentBlockIndex + 1;
    setCurrentBlockIndex(nextIndex);

    if (nextIndex >= sessionData.block_stats.length) {
        Alert.alert("Session Complete!", "All blocks are finished.");
    }
  };
  
  const handleFinishSession = async () => {
    if (!user) { Alert.alert("Error", "User not found."); return; }
    disconnectFromDevice();
    try {
      await fetch(`http://172.20.10.6:4949/user/${user.UserID}/sessions/${SessionID}/active-session`, { method: 'PUT' });
      Alert.alert("Success", "Your session has been saved.", [
        { text: "OK", onPress: () => router.replace('/Dashboard') }
      ]);
    } catch (error) {
      console.error("Failed to end session:", error);
      Alert.alert("Error", "Could not save your session.");
    }
  };

  // --- RENDER LOGIC (no changes here) ---
  if (isLoading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#F1C40F" /></View>;
  }
  if (!sessionData) {
    return <View style={styles.container}><Text style={styles.errorText}>Could not load session.</Text></View>;
  }
  const currentBlock = isSessionComplete ? null : sessionData.block_stats[currentBlockIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isSessionComplete ? (
          <View style={styles.card}>
            <Ionicons name="trophy" size={80} color="#F1C40F" />
            <Text style={styles.cardTitle}>Session Complete!</Text>
            <Text style={styles.cardSubtitle}>Great work. Save your session to see your stats.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.blockTitle}>Block {currentBlockIndex + 1} of {sessionData.block_stats.length}</Text>
            <Text style={styles.targetArea}>{currentBlock?.TargetArea}</Text>
            <Text style={styles.shotCounter}>
              {currentBlock?.MadeShots} / {currentBlock?.ShotsPlanned}
            </Text>
            <Text style={styles.shotsLabel}>Shots Recorded</Text>
          </View>
        )}

        <View style={styles.controls}>
          <View style={styles.bleStatus}>
            <Text style={styles.bleStatusText}>Sensor: {connectionStatus}</Text>
          </View>
          
          {!device ? (
            <TouchableOpacity style={styles.buttonPrimary} onPress={scanForDevices}>
              <Ionicons name="bluetooth" size={24} color="#121212" />
              <Text style={styles.buttonPrimaryText}>Connect Sensor</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.buttonSecondary} onPress={disconnectFromDevice}>
              <Ionicons name="close-circle" size={24} color="#F1C40F" />
              <Text style={styles.buttonSecondaryText}>Disconnect</Text>
            </TouchableOpacity>
          )}

          {!isSessionComplete ? (
            <TouchableOpacity style={styles.buttonTertiary} onPress={handleFinishBlock}>
                <Ionicons name="checkmark-done-outline" size={22} color="#A0A0A0" />
                <Text style={styles.buttonTertiaryText}>Finish Block</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.buttonPrimary} onPress={handleFinishSession}>
              <Ionicons name="save" size={24} color="#121212" />
              <Text style={styles.buttonPrimaryText}>Finish & Save Session</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- Styles remain the same ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#121212',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    blockTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#A0A0A0',
        position: 'absolute',
        top: 15,
        left: 20,
    },
    targetArea: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginVertical: 10,
        textAlign: 'center',
    },
    shotCounter: {
        fontSize: 90,
        fontWeight: 'bold',
        color: '#F1C40F',
        lineHeight: 100,
    },
    shotsLabel: {
        fontSize: 18,
        color: '#A0A0A0',
        marginTop: 5,
    },
    cardTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 20,
    },
    cardSubtitle: {
        fontSize: 18,
        color: '#B0B0B0',
        textAlign: 'center',
        marginTop: 10,
    },
    controls: {
        width: '100%',
        paddingBottom: 20,
        alignItems: 'center',
    },
    bleStatus: {
        alignItems: 'center',
        marginBottom: 20,
    },
    bleStatusText: {
        fontSize: 16,
        color: '#888',
    },
    buttonPrimary: {
        backgroundColor: '#F1C40F',
        borderRadius: 12,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    buttonPrimaryText: {
        color: '#121212',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        borderColor: '#F1C40F',
        borderWidth: 2,
        borderRadius: 12,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    buttonSecondaryText: {
        color: '#F1C40F',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    buttonTertiary: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 10,
        marginTop: 15,
    },
    buttonTertiaryText: {
        color: '#A0A0A0',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    errorText: {
        color: '#E74C3C',
        fontSize: 18,
    }
  });