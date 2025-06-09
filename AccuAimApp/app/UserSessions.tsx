import React, { useState, useEffect, useLayoutEffect } from "react";
import { Text, View, ScrollView, Button, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from './AuthContext'; // Assuming the AuthContext is in the same folder
import { useNavigation, useRouter } from "expo-router";

// Session interface
interface Session {
  sessionId: number;
  userId: number;
  startTime: string;
  endTime: string;
}

export default function UserSessions() {
  const { user } = useAuth(); // Get logged-in user from AuthContext
  const router = useRouter();
  const navigation = useNavigation();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Set up the navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Sessions",
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
          <Text style={{ color: "#F1C40F", fontSize: 26 }}>←</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Fetch user sessions when the user is logged in
  useEffect(() => {
    if (user) {
      fetchUserSessions(user.UserID); // Fetch sessions using the logged-in user's ID
    } else {
      setError("User not logged in");
      setLoading(false);
    }
  }, [user]);

  // Function to fetch user sessions
  const fetchUserSessions = async (userId: string) => {
    try {
      const response = await fetch(`http://172.31.0.87:4949/user/${userId}/sessions`);
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const formattedSessions: Session[] = data.map((session: [number, number, string, string]) => ({
          sessionId: session[0],
          userId: session[1],
          startTime: session[2],
          endTime: session[3],
        }));
        setSessions(formattedSessions);
      } else {
        setError("No sessions found");
      }
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      setError("Failed to load user sessions");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Helper function to calculate session duration
  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationInMs = end.getTime() - start.getTime();
    const durationInMin = Math.floor(durationInMs / 1000 / 60);
    const hours = Math.floor(durationInMin / 60);
    const minutes = durationInMin % 60;
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
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
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {sessions.map((session) => (
        <View key={session.sessionId} style={styles.sessionItem}>
          <Text style={styles.sessionText}>Session ID: {session.sessionId}</Text>
          <Text style={styles.sessionText}>
            Date: {formatDate(session.startTime)}
          </Text>
          <Text style={styles.sessionText}>
            Duration: {calculateDuration(session.startTime, session.endTime)}
          </Text>
          <Button title="View Details" onPress={() => router.push(`/user/sessions/${session.sessionId}`)} color="#F1C40F"/>
        </View>
      ))}
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
  sessionItem: {
    backgroundColor: "#333",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  sessionText: {
    fontSize: 16,
    color: "#F1C40F",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#F1C40F",  // Same gold color as other text
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
});
