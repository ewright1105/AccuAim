import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "./AuthContext";
import { useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Session interface (no changes needed)
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
  const [isFirstLoad, setIsFirstLoad] = useState(true); // To check if it's the initial empty state

  // --- Header Setup ---
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "My Practice Sessions",
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
        setIsFirstLoad(true); // Set flag for empty state
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Something went wrong while loading your sessions.");
    } finally {
      setLoading(false);
    }
  };

  // --- Helper Functions ---
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    if (!end) return 'In Progress'; // Handle sessions that haven't ended
    const s = new Date(start), e = new Date(end);
    const mins = Math.floor((e.getTime() - s.getTime()) / 60000);
    if (mins < 1) return "< 1 min";
    const h = Math.floor(mins / 60), m = mins % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#F1C40F" />
        <Text style={styles.messageText}>Loading your sessions...</Text>
      </View>
    );
  }

  if (error && isFirstLoad) {
    // Show a friendly empty state if there are no sessions
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="archive-outline" size={60} color="#666" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/CreateSession')}
        >
            <Ionicons name="add-circle" size={20} color="#121212" style={{marginRight: 10}}/>
            <Text style={styles.ctaButtonText}>Start Your First Session</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
      // Show a generic error for other issues
      return (
          <View style={styles.centeredContainer}><Text style={styles.errorText}>{error}</Text></View>
      )
  }

  return (
    <ScrollView style={styles.container}>
      {sessions.map((session) => (
        <TouchableOpacity
          key={session.sessionId}
          style={styles.sessionCard}
          onPress={() => router.push(`/user/sessions/${session.sessionId}`)}
        >
          <View style={styles.sessionInfoContainer}>
            <View style={styles.sessionInfoRow}>
              <Ionicons name="calendar-outline" size={18} color="#B0B0B0" style={styles.icon} />
              <Text style={styles.sessionDate}>{formatDate(session.startTime)}</Text>
            </View>
            <View style={styles.sessionInfoRow}>
              <Ionicons name="time-outline" size={18} color="#B0B0B0" style={styles.icon} />
              <Text style={styles.sessionDuration}>
                {calculateDuration(session.startTime, session.endTime)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="#F1C40F" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  headerButton: {
    marginLeft: 15,
  },
  sessionCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionInfoContainer: {
    flex: 1,
  },
  sessionInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 10,
  },
  sessionDate: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sessionDuration: {
    fontSize: 16,
    color: "#B0B0B0",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  messageText: {
    marginTop: 15,
    color: "#F1C40F",
    fontSize: 16,
  },
  errorText: {
    color: "#B0B0B0",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 25,
  },
  ctaButton: {
    backgroundColor: '#F1C40F',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
});