import { Text, View, ScrollView, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function UserDetails() {
  const { id } = useLocalSearchParams(); // Retrieve the user ID from the route parameters
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
    timestamp: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:4949/users/${id}`);
      const data = await response.json();

      // Now handle the API response correctly
      if (data && data.length > 0) {
        const userData = data;
        setUser({
          id: userData[0], 
          email: userData[1], 
          name: userData[2], 
          timestamp: userData[3], 
        });
      } else {
        setError("User not found");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        User Details
      </Text>
      {user && (
        <View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>ID:</Text>
            <Text style={{ fontSize: 16 }}>{user.id}</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Name:</Text>
            <Text style={{ fontSize: 16 }}>{user.name}</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Email:</Text>
            <Text style={{ fontSize: 16 }}>{user.email}</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Created:</Text>
            <Text style={{ fontSize: 16 }}>{user.timestamp}</Text>
          </View>
        </View>
      )}

      <Button title="Go Back" onPress={() => router.back()} />
    </ScrollView>
  );
}
