import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useAuth } from "../../AuthContext";
import { Ionicons } from "@expo/vector-icons";

// --- Type Definitions ---
interface Shot {
  ShotID: number;
  BlockID: number;
  ShotTime: string;
  ShotPositionX: string;
  ShotPositionY: string;
  Result: "Made" | "Missed";
}

interface Block {
    BlockID: number;
    TargetArea: string;
    ShotsPlanned: number;
    MadeShots: number;
    MissedShots: number;
}

interface SessionDetailsData {
  made_shots: number;
  missed_shots: number;
  total_shots: number;
  shooting_percentage: string;
  shots: Shot[][];
  block_stats: Block[];
}

type RootStackParamList = {
  SessionDetails: { sessionId: number };
};

type SessionDetailsRouteProp = RouteProp<RootStackParamList, 'SessionDetails'>;

export default function SessionDetails() {
  const { user } = useAuth();
  const route = useRoute<SessionDetailsRouteProp>();
  const { sessionId } = route.params;

  const [sessionData, setSessionData] = useState<SessionDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(-1); // -1 for "All"

  const navigation = useNavigation();

  // --- Header and Data Fetching Hooks ---
  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Session #${sessionId}`,
      headerStyle: { backgroundColor: "#121212" },
      headerTitleStyle: { color: "#FFFFFF" },
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#F1C40F" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, sessionId]);

  useEffect(() => {
    if (user && sessionId) {
      fetchSessionData(Number(user.UserID), sessionId);
    } else {
      setError("User not logged in or invalid session ID.");
      setLoading(false);
    }
  }, [user, sessionId]);

  const fetchSessionData = async (userId: number, sid: number) => {
    try {
      setLoading(true);
      const apiUrl = `http://127.0.0.1:4949/user/${userId}/sessions/${sid}`;
      const response = await fetch(apiUrl);

      if (!response.ok) throw new Error("Failed to fetch session data.");

      const data: SessionDetailsData = await response.json();
      setSessionData(data);
    } catch (err) {
      console.error("Error fetching session data:", err);
      setError("An error occurred while loading session details.");
    } finally {
      setLoading(false);
    }
  };

  // --- Helper Functions ---
  const plotShotPosition = (xStr: string, yStr: string) => {
    const goalSize = 6;
    const frameSize = 250;
    const markerSize = 10;
    
    const pixelsPerFoot = frameSize / goalSize;
    const x = parseFloat(xStr) * pixelsPerFoot;
    const y = frameSize - (parseFloat(yStr) * pixelsPerFoot);

    return {
      left: Math.max(0, Math.min(frameSize - markerSize, x - markerSize / 2)),
      top: Math.max(0, Math.min(frameSize - markerSize, y - markerSize / 2)),
    };
  };
  
  const getFilteredShots = () => {
      if (!sessionData) return [];
      if (selectedBlockIndex === -1) {
          return sessionData.shots.flat();
      }
      return sessionData.shots[selectedBlockIndex] || [];
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#F1C40F" />
        <Text style={styles.messageText}>Loading Session Details...</Text>
      </View>
    );
  }

  if (error || !sessionData) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#E74C3C"/>
        <Text style={styles.errorText}>{error || "No session data available."}</Text>
      </View>
    );
  }

  const filteredShots = getFilteredShots();

  return (
    <ScrollView style={styles.container}>
      {/* Session Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { flex: 1.5, borderColor: '#3498DB', borderWidth: 1.5 }]}>
          <Text style={styles.statValue}>{sessionData.shooting_percentage}</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{sessionData.made_shots}</Text>
          <Text style={styles.statLabel}>Made</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{sessionData.missed_shots}</Text>
          <Text style={styles.statLabel}>Missed</Text>
        </View>
      </View>

      {/* Heatmap Section */}
      <View style={styles.heatmapCard}>
        <Text style={styles.sectionHeader}>Shooting Heatmap</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            <TouchableOpacity onPress={() => setSelectedBlockIndex(-1)} style={[styles.filterButton, selectedBlockIndex === -1 && styles.filterButtonActive]}>
                <Text style={[styles.filterText, selectedBlockIndex === -1 && styles.filterTextActive]}>All Shots</Text>
            </TouchableOpacity>
            {sessionData?.block_stats?.map((block, index) => (
                <TouchableOpacity key={block.BlockID} onPress={() => setSelectedBlockIndex(index)} style={[styles.filterButton, selectedBlockIndex === index && styles.filterButtonActive]}>
                    <Text style={[styles.filterText, selectedBlockIndex === index && styles.filterTextActive]}>{block.TargetArea}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
        <View style={styles.goalContainer}>
          {/* Goal posts created with three separate views */}
          <View style={styles.goalPostTop} />
          <View style={styles.goalPostLeft} />
          <View style={styles.goalPostRight} />
          
          {filteredShots.map((shot) => {
            const position = plotShotPosition(shot.ShotPositionX, shot.ShotPositionY);
            return (
              <View
                key={shot.ShotID}
                style={[
                  styles.shotMarker,
                  { left: position.left, top: position.top, backgroundColor: shot.Result === "Made" ? "#2ECC71" : "#E74C3C" },
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Shot List Section */}
      <View style={styles.shotListCard}>
        <Text style={styles.sectionHeader}>
            {selectedBlockIndex === -1 ? 'All Shots' : `Block ${selectedBlockIndex + 1} Shots`}
        </Text>
        {filteredShots.length > 0 ? (
            filteredShots.map((shot) => (
                <View key={shot.ShotID} style={styles.shotItem}>
                    <View style={[styles.shotResultDot, { backgroundColor: shot.Result === "Made" ? "#2ECC71" : "#E74C3C" }]} />
                    <Text style={styles.shotItemText}>
                        Shot #{shot.ShotID} <Text style={styles.shotItemMuted}>at ({shot.ShotPositionX}, {shot.ShotPositionY})</Text>
                    </Text>
                </View>
            ))
        ) : (
            <Text style={styles.noShotsText}>No shots recorded for this block.</Text>
        )}
      </View>
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#121212", padding: 15 },
    headerButton: { marginLeft: 15 },
    centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212", padding: 20 },
    messageText: { marginTop: 15, color: "#F1C40F", fontSize: 16 },
    errorText: { color: "#B0B0B0", fontSize: 18, textAlign: "center", marginTop: 20 },
    
    // Stats
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 },
    statCard: { flex: 1, backgroundColor: '#1E1E1E', borderRadius: 12, padding: 15, alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
    statLabel: { fontSize: 14, color: '#B0B0B0', marginTop: 5 },
    
    // Heatmap
    heatmapCard: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 20, marginBottom: 20 },
    sectionHeader: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 15 },
    filterContainer: { marginBottom: 15 },
    filterButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#333', marginRight: 10 },
    filterButtonActive: { backgroundColor: '#F1C40F' },
    filterText: { color: '#FFFFFF', fontWeight: '500' },
    filterTextActive: { color: '#121212', fontWeight: 'bold' },
    
    // Goal Styles
    goalContainer: { 
        alignSelf: 'center', 
        width: 250, 
        height: 250, 
        backgroundColor: '#121212', 
        borderRadius: 8, 
        position: 'relative',
        borderWidth: 1,
        borderColor: '#444'
    },
    goalPostTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4, // Pipe thickness
        backgroundColor: '#E67E22', // Orange
    },
    goalPostLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 4, // Pipe thickness
        height: '100%',
        backgroundColor: '#E67E22', // Orange
    },
    goalPostRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 4, // Pipe thickness
        height: '100%',
        backgroundColor: '#E67E22', // Orange
    },
    shotMarker: { 
        position: 'absolute', 
        width: 10, 
        height: 10, 
        borderRadius: 5, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.5)' 
    },

    // Shot List
    shotListCard: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 20, marginBottom: 40 },
    shotItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 10, 
        borderBottomWidth: 1, 
        borderBottomColor: '#333' 
    },
    shotResultDot: { width: 10, height: 10, borderRadius: 5, marginRight: 15 },
    shotItemText: { fontSize: 16, color: '#FFFFFF' },
    shotItemMuted: { color: '#888' },
    noShotsText: { color: '#B0B0B0', textAlign: 'center', paddingVertical: 20 }
});