import { Text, View, ScrollView } from "react-native";
import { useEffect, useState } from 'react';

export default function Index() {
  // Step 1: Define the user type and useState with the correct type for the fetched data
  type User = {
    id: number;
    email: string;
    name: string;
    timestamp: string;
  };

  const [users, setUsers] = useState<User[] | null>(null);  // users will be an array of User objects or null

  useEffect(() => {
    // Fetching data from the API
    fetch('http://12.0.0.1:4949/')  // Change to the appropriate address for Android Emulator
      .then(response => response.json())
      .then(data => {
        console.log(data);  // Log the fetched data for debugging
        // Step 2: Map the array of arrays into an array of objects
        const usersList = data.map((userData: [number, string, string, string]) => ({
          id: userData[0],
          email: userData[1],
          name: userData[2],
          timestamp: userData[3],
        }));
        setUsers(usersList);  // Update the state with the mapped users data
      })
      .catch(error => {
        console.error('Error fetching users data:', error);
      });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      {/* Step 3: Conditional rendering based on users state */}
      {users ? (
        <ScrollView>
          {users.map((user) => (
            <View key={user.id} style={{ marginBottom: 10 }}>
              <Text><strong>Name:</strong> {user.name}</Text>
              <Text><strong>Email:</strong> {user.email}</Text>
              <Text><strong>Timestamp:</strong> {user.timestamp}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text>Loading...</Text>  // Display loading message while data is being fetched
      )}
    </View>
  );
}
