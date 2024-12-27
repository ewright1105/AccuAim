import { Text, View, ScrollView } from "react-native";
import { useEffect, useState, useLayoutEffect} from 'react';
import { useNavigation } from "expo-router";

export default function Index() {
  // Define the user type and useState with the correct type for the fetched data
  type User = {
    id: number;
    email: string;
    name: string;
    timestamp: string;
  };

  const [users, setUsers] = useState<User[] | null>(null);  // users will be an array of User objects or null

  useEffect(() => {
    // Fetching data from the API
    fetch('http://127.0.0.1:4949/')  
      .then(response => response.json())
      .then(data => {
        
        // Map the array of arrays into an array of objects
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
  const navigation = useNavigation()
  useLayoutEffect( () => {
    navigation.setOptions({
      title: "User List",
    })
  }, [navigation]);
  
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
          {users.map(user => (
            <View key={user.id} style={{ marginBottom: 10 }}>
              <Text>User {user.id}</Text>
              <Text>Name: {user.name}</Text>
              <Text>Email: {user.email}</Text>
              <Text>Created: {user.timestamp}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text>Loading...</Text>  // Display loading message while data is being fetched
      )}
    </View>
  );
}
