import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import { useAuth } from "./AuthContext";
import { useNavigation, useRouter } from "expo-router";

// Session interface
interface Session {
  sessionId: number;
  userId: number;
  startTime: string;
  endTime: string;
}

export default function UserSessions() {
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "My Practice Sessions",
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (user) {
      fetchUserSessions(user.UserID);
    } else {
      setError("You must be logged in to view your sessions.");
      setLoading(false);
    }
  }, [user]);

  const fetchUserSessions = async (userId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:4949/user/${userId}/sessions`);
      if (!response.ok) throw new Error("Could not fetch sessions.");
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const formatted: Session[] = data.map(
          (session: [number, number, string, string]) => ({
            sessionId: session[0],
            userId: session[1],
            startTime: session[2],
            endTime: session[3],
          })
        );
        setSessions(formatted);
      } else {
        setError("You haven't recorded any sessions yet.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Something went wrong while loading your sessions.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const s = new Date(start), e = new Date(end);
    const mins = Math.floor((e.getTime() - s.getTime()) / 60000);
    const h = Math.floor(mins / 60), m = mins % 60;
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#F1C40F" />
        <Text style={styles.loadingText}>Loading your sessions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Your Practice Sessions</Text>
      {sessions.map((session) => (
        <View key={session.sessionId} style={styles.sessionItem}>
          <Text style={styles.sessionText}>📅 {formatDate(session.startTime)}</Text>
          <Text style={styles.sessionText}>
            🕒 Duration: {calculateDuration(session.startTime, session.endTime)}
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/user/sessions/${session.sessionId}`)}
            style={styles.viewButton}
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    color: "#F1C40F",
    marginBottom: 20,
  },
  sessionItem: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#2c2c2c",
  },
  sessionText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 6,
  },
  viewButton: {
    marginTop: 8,
    backgroundColor: "#F1C40F",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#121212",
    fontWeight: "600",
    fontSize: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#F1C40F",
    fontSize: 16,
  },
  errorText: {
    color: "#F1C40F",
    fontSize: 18,
    textAlign: "center",
  },
  backButton: {
    marginLeft: 15,
  },
  backArrow: {
    color: "#F1C40F",
    fontSize: 26,
  },
});
