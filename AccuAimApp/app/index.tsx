import { Text, View, ScrollView, TextInput, Button, Alert} from "react-native";
import { useEffect, useState, useLayoutEffect } from "react";
import { useNavigation, useRouter } from "expo-router";

export default function Index() {

  type User = {
    id: number;
    email: string;
    name: string;
    timestamp: string;
  };

  const [users, setUsers] = useState<User[]>([]); 
  const router = useRouter();


  useEffect(() => {
    fetchUsers();
  }, []); 

  // Function to fetch users from the API
  const fetchUsers = () => {
    fetch("http://127.0.0.1:4949/users")
      .then((response) => response.json())
      .then((data) => {
        const usersList = data.map((userData: [number, string, string, string]) => ({
          id: userData[0],
          email: userData[1],
          name: userData[2],
          timestamp: userData[3],
        }));
        setUsers(usersList); 
      })
      .catch((error) => {
        console.error("Error fetching users data:", error);
      });
  };
 

  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "AccuAim",
    });
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
      <Button title="Login" onPress={()=> {router.push("/Login")}} />
      <Button title="Sign Up" onPress={()=> {router.push("/SignUp")}} />
      {/* Conditional rendering based on users state 
      {users.length > 0 ? (
        <ScrollView>
          {users.map((user) => (
            <View key={user.id} style={{ marginBottom: 10 }}>
              <Text>User {user.id}</Text>
              <Text>Name: {user.name}</Text>
              <Text>Email: {user.email}</Text>
              <Text>Created: {user.timestamp}</Text>

              
              <Button title="View Details" onPress={() => {
                  router.push(`/${user.id}`);
                }} 
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text>No users to display...</Text> 
      )} */}
    </View>
  );
}