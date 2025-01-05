import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from '../../AuthContext';

interface Shot {
  ShotID: number;
  SessionID: number;
  ShotTime: string;
  ShotPositionX: number;
  ShotPositionY: number;
  Result: 'Made' | 'Missed';
}

interface SessionDetailsData {
  user_id: number;
  session_id: number;
  made_shots: number;
  missed_shots: number;
  total_shots: number;
  shooting_percentage: string;
  shots: Shot[]; // Array of shot objects
}

export default function SessionDetails() {
  const { user } = useAuth();
  const route = useRoute();
  
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
      fetchSessionData(Number(user.UserID), sessionId); 
    } else {
      setError("User not logged in or invalid session ID.");
      setLoading(false);
    }
  }, [user, sessionId]);

  const fetchSessionData = async (userId: number, sessionId: number) => {
    try {
      setLoading(true);
      const apiUrl = `http://127.0.0.1:4949/user/${userId}/sessions/${sessionId}`;
      const response = await fetch(apiUrl);

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

  const plotShotPosition = (x: number, y: number, result: 'Made' | 'Missed') => {
    const goalSize = 6;         // 6 feet for both width and height
    const innerFrameSize = 200; // The inner goal frame size in pixels
    const outerFrameSize = 300; // The outer container size in pixels
    const markerSize = 10;      // Size of the shot marker
    const offset = (outerFrameSize - innerFrameSize) / 2; // Centering offset for outer container
    
    // Scale factor to convert feet to pixels - using outer frame size for full range
    const pixelsPerFoot = innerFrameSize / goalSize;
    
    // Convert coordinates - no special handling needed for missed shots
    // They'll naturally fall outside the 6x6 frame if their coordinates are >6
    let normX = x * pixelsPerFoot;
    let normY = innerFrameSize - (y * pixelsPerFoot); // Flip Y for screen coordinates
  
    // Add offset to center the inner frame in the outer container
    normX += offset;
    normY += offset;
  
    // Ensure shots stay within outer container bounds
    normX = Math.max(markerSize, Math.min(outerFrameSize - markerSize, normX));
    normY = Math.max(markerSize, Math.min(outerFrameSize - markerSize, normY));
  
    // Center the marker on the calculated position
    return {
      left: normX - markerSize/2,
      top: normY - markerSize/2
    };
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
      {/* Session Details */}
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

      {/* Lacrosse Goal Representation */}
      <View style={styles.goalContainer}>
      <Text style={styles.shotsHeader}>Shooting Heatmap</Text>
        <View style={styles.outerContainer}>
          <View style={styles.innerGoal} />
          {sessionData.shots.map((shot) => {
            const position = plotShotPosition(shot.ShotPositionX, shot.ShotPositionY, shot.Result);
            return (
              <View
                key={shot.ShotID}
                style={[
                  styles.shotMarker,
                  {
                    left: position.left,
                    top: position.top,
                    backgroundColor: shot.Result === "Made" ? "green" : "red",
                  },
                ]}
              />
            );
          })}
      </View>
    </View>

      {/* Shots Details */}
      <View style={styles.shotsDetailsContainer}>
        <Text style={styles.shotsHeader}>Shots Details:</Text>
        {sessionData.shots.map((shot) => (
          <View key={shot.ShotID} style={styles.shotContainer}>
            <Text style={styles.shotText}>
              <Text style={styles.boldText}>Shot ID:</Text> {shot.ShotID}
            </Text>
            <Text style={styles.shotText}>
              <Text style={styles.boldText}>Time:</Text> {shot.ShotTime}
            </Text>
            <Text style={styles.shotText}>
              <Text style={styles.boldText}>Position:</Text> ({shot.ShotPositionX}, {shot.ShotPositionY})
            </Text>
            <Text style={styles.shotText}>
              <Text style={styles.boldText}>Result:</Text> {shot.Result}
            </Text>
          </View>
        ))}
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
  shotsDetailsContainer: {
    backgroundColor: "#444",
    padding: 15,
    borderRadius: 8,
  },
  shotsHeader: {
    fontSize: 18,
    color: "#F1C40F",
    fontWeight: "bold",
    marginBottom: 10,
  },
  shotContainer: {
    marginBottom: 15,
  },
  shotText: {
    fontSize: 16,
    color: "#F1C40F",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  goalContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  outerContainer: {
    position: "relative",
    width: 300,  // Larger container to show missed shots
    height: 300,
    borderWidth: 2,
    borderColor: "#666", // Darker border for outer container
    borderRadius: 8,
    backgroundColor: "#333", // Darker background for missed shot area
  },
  innerGoal: {
    position: "absolute",
    width: 200,  // 6x6 goal frame
    height: 200,
    borderWidth: 2,
    borderColor: "#E67E22",
    borderBottomColor: "transparent",
    borderRadius: 8,
    backgroundColor: "#222",
    left: 50,   // Center the inner goal: (300-200)/2 = 50
    top: 50,
  },
  shotMarker: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
