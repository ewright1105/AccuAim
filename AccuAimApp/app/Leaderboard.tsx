import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// --- Type Definitions ---
interface LeaderboardUser {
  UserID: number;
  FullName: string;
  TotalMade: number;
  TotalPlanned: number;
  AccuracyPercent: string;
}

type SortOption = 'accuracy' | 'made' | 'planned';

export default function Leaderboard() {
  const navigation = useNavigation();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('accuracy'); // Default sort

  // --- Header Setup ---
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Leaderboard",
      headerStyle: { backgroundColor: "#121212" },
      headerTitleStyle: { color: "#FFFFFF" },
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#F1C40F" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // --- Data Fetching ---
  // This useEffect will re-run whenever the `sortBy` state changes
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        // Append the sortBy state as a query parameter to the URL
        const response = await fetch(`http://127.0.0.1:4949/leaderboard?sort_by=${sortBy}`);
        if (!response.ok) throw new Error("Failed to load leaderboard data.");
        
        const data = await response.json();
        setLeaderboardData(data);
      } catch (err) {
        setError("Could not load the leaderboard. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [sortBy]);

  // --- Render Logic ---
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#F1C40F" style={{ marginTop: 50 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    return leaderboardData.map((user, index) => (
      <View key={user.UserID} style={styles.userCard}>
        <Text style={styles.rank}>#{index + 1}</Text>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.FullName}</Text>
          <Text style={styles.stats}>
            Made: {user.TotalMade} / Planned: {user.TotalPlanned}
          </Text>
          <Text style={styles.accuracy}>Accuracy: {user.AccuracyPercent}</Text>
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Sorting Controls */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort By:</Text>
        <TouchableOpacity
          onPress={() => setSortBy('accuracy')}
          style={[styles.sortButton, sortBy === 'accuracy' && styles.sortButtonActive]}
        >
          <Text style={[styles.sortButtonText, sortBy === 'accuracy' && styles.sortButtonTextActive]}>Accuracy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSortBy('made')}
          style={[styles.sortButton, sortBy === 'made' && styles.sortButtonActive]}
        >
          <Text style={[styles.sortButtonText, sortBy === 'made' && styles.sortButtonTextActive]}>Made</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSortBy('planned')}
          style={[styles.sortButton, sortBy === 'planned' && styles.sortButtonActive]}
        >
          <Text style={[styles.sortButtonText, sortBy === 'planned' && styles.sortButtonTextActive]}>Planned</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>{renderContent()}</ScrollView>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 15 },
  headerButton: { marginLeft: 15 },
  // Sorting Controls Styles
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  sortLabel: {
    color: '#B0B0B0',
    fontSize: 16,
    marginRight: 10,
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#333',
    marginHorizontal: 5,
  },
  sortButtonActive: {
    backgroundColor: '#F1C40F',
  },
  sortButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#121212',
  },
  // Leaderboard Card Styles
  userCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  rank: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F1C40F",
    marginRight: 20,
    width: 40,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  stats: {
    fontSize: 16,
    color: "#B0B0B0",
    marginTop: 4,
  },
  accuracy: {
    fontSize: 16,
    color: "#2ECC71", // Green for accuracy
    fontWeight: '500',
    marginTop: 4,
  },
  errorText: {
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});