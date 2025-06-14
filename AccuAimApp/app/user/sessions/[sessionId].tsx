import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useAuth } from "../../AuthContext";
import { Ionicons } from "@expo/vector-icons";

// --- Updated Type Definitions ---
// Shot interface is no longer needed on this screen
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
  total_shots: number; // This is the total planned shots
  shooting_percentage: string;
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
      const apiUrl = `http://172.20.10.6:4949/user/${userId}/sessions/${sid}`;
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

  return (
    <ScrollView style={styles.container}>
      {/* Session Summary Stats */}
      <View style={styles.summaryContainer}>
          <Text style={styles.sectionHeader}>Session Summary</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { flex: 1.5, borderColor: '#3498DB', borderWidth: 1.5 }]}>
              <Text style={styles.statValue}>{sessionData.shooting_percentage}</Text>
              <Text style={styles.statLabel}>Session Accuracy</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{sessionData.made_shots}</Text>
              <Text style={styles.statLabel}>Shots Made</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{sessionData.total_shots}</Text>
              <Text style={styles.statLabel}>Shots Taken</Text>
            </View>
          </View>
      </View>

      {/* Block-by-Block Breakdown */}
      <View>
          <Text style={styles.sectionHeader}>Performance by Target</Text>
          {sessionData.block_stats.length > 0 ? (
              sessionData.block_stats.map((block) => {
                  const blockAccuracy = block.ShotsPlanned > 0 
                      ? ((block.MadeShots / block.ShotsPlanned) * 100).toFixed(1) + '%' 
                      : 'N/A';
                  
                  return (
                      <View key={block.BlockID} style={styles.blockCard}>
                          <View>
                              <Text style={styles.blockTitle}>{block.TargetArea}</Text>
                              <Text style={styles.blockSubTitle}>{`${block.MadeShots} / ${block.ShotsPlanned} shots made`}</Text>
                          </View>
                          <Text style={styles.blockAccuracy}>{blockAccuracy}</Text>
                      </View>
                  );
              })
          ) : (
              <View style={styles.blockCard}>
                <Text style={styles.noShotsText}>No practice blocks were recorded for this session.</Text>
              </View>
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
    
    sectionHeader: { 
        fontSize: 22, 
        fontWeight: '600', 
        color: '#FFFFFF', 
        marginBottom: 15,
        paddingHorizontal: 5
    },
    
    // Session Summary
    summaryContainer: {
        marginBottom: 30,
    },
    statsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        gap: 10 
    },
    statCard: { 
        flex: 1, 
        backgroundColor: '#1E1E1E', 
        borderRadius: 12, 
        padding: 15, 
        alignItems: 'center' 
    },
    statValue: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#FFFFFF' 
    },
    statLabel: { 
        fontSize: 14, 
        color: '#B0B0B0', 
        marginTop: 5 
    },

    // Block Breakdown
    blockCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    blockTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    blockSubTitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    blockAccuracy: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3498DB',
    },
    noShotsText: { 
        color: '#B0B0B0', 
        textAlign: 'center' 
    }
});