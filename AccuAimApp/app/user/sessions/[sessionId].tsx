import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from '../../AuthContext';

interface SessionDetailsData {
  user_id: number;
  session_id: number;
  made_shots: number;
  missed_shots: number;
  total_shots: number;
  shooting_percentage: string;
}

export default function SessionDetails() {
  const { user } = useAuth();
  const route = useRoute();
  
  // Ensure the sessionId is passed correctly as a number
  const { sessionId } = route.params as { sessionId: number };

  const [sessionData, setSessionData] = useState<SessionDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation();
  
    useLayoutEffect(() => {
      navigation.setOptions({
        title: "Session Details",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 15 }}
          >
             <Text style={{ color: "#F1C40F", fontSize: 26 }}>←</Text>
          </TouchableOpacity>
        ),
      });
    }, [navigation]);

  useEffect(() => {
    if (user && sessionId) {
      // Convert user.id to a number if necessary
      fetchSessionData(Number(user.id), sessionId); 
    } else {
      setError("User not logged in or invalid session ID.");
      setLoading(false);
    }
  }, [user, sessionId]);

  const fetchSessionData = async (userId: number, sessionId: number) => {
    try {
      setLoading(true);
      const apiUrl = `http://127.0.0.1:4949/user/${userId}/sessions/${sessionId}`;  // Changed to localhost
      const response = await fetch(apiUrl);

      // Check if the response is OK
      if (!response.ok) {
        throw new Error("Failed to fetch session data.");
      }

      const data: SessionDetailsData = await response.json();

      setSessionData(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching session data:", err);
      setError("Error fetching session data.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!sessionData) {
    return (
      <View style={styles.centeredContainer}>
        <Text>No session data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.sessionDetailsContainer}>
        <Text style={styles.sessionDetailText}>
          <Text style={styles.boldText}>Session ID:</Text> {sessionData.session_id}
        </Text>
        <Text style={styles.sessionDetailText}>
          <Text style={styles.boldText}>User ID:</Text> {sessionData.user_id}
        </Text>
        <Text style={styles.sessionDetailText}>
          <Text style={styles.boldText}>Made Shots:</Text> {sessionData.made_shots}
        </Text>
        <Text style={styles.sessionDetailText}>
          <Text style={styles.boldText}>Missed Shots:</Text> {sessionData.missed_shots}
        </Text>
        <Text style={styles.sessionDetailText}>
          <Text style={styles.boldText}>Total Shots:</Text> {sessionData.total_shots}
        </Text>
        <Text style={styles.sessionDetailText}>
          <Text style={styles.boldText}>Shooting Percentage:</Text> {sessionData.shooting_percentage}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F1C40F",
    marginBottom: 20,
  },
  sessionDetailsContainer: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sessionDetailText: {
    fontSize: 16,
    color: "#F1C40F",
    marginVertical: 5,
  },
  boldText: {
    fontWeight: "bold",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
