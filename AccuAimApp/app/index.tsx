import { Text, View, ScrollView, TextInput, Button } from "react-native";
import { useEffect, useState, useLayoutEffect } from "react";
import { useNavigation } from "expo-router";

export default function Index() {

  type User = {
    id: number;
    email: string;
    name: string;
    timestamp: string;
  };

  const [users, setUsers] = useState<User[]>([]); 
  const [newName, setNewName] = useState(""); 
  const [newEmail, setNewEmail] = useState(""); 

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
  const addUser = () => {
    const name = newName.trim();
    const email = newEmail.trim();
    if (name && email) {
      fetch("http://127.0.0.1:4949/users", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => response.json())
        .then(() => {
          //refresh users list to show new user and reset input fields
          fetchUsers()
          setNewName(""); 
          setNewEmail(""); 
        })
        .catch((error) => {
          console.error("Error adding user:", error);
        });
    }
  };
  // Function to delete a user
  const deleteUser = (id: number) => {
    fetch("http://127.0.0.1:4949/users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        UserID: id,  
      }),
    })
      .then((response) => response.json())  
      .then(() => {
        fetchUsers();  // Refresh the users list after deletion
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  };

  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "User List",
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
      {/* Input fields for new user */}
      <TextInput
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 10,
          width: "100%",
          paddingHorizontal: 10,
        }}
        placeholder="Enter name"
        value={newName}
        onChangeText={setNewName}
      />
      <TextInput
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
          width: "100%",
          paddingHorizontal: 10,
        }}
        placeholder="Enter email"
        value={newEmail}
        onChangeText={setNewEmail}
        keyboardType="email-address"
      />

      <Button title="Add User" onPress={addUser} />

      {/* Conditional rendering based on users state */}
      {users.length > 0 ? (
        <ScrollView>
          {users.map((user) => (
            <View key={user.id} style={{ marginBottom: 10 }}>
              <Text>User {user.id}</Text>
              <Text>Name: {user.name}</Text>
              <Text>Email: {user.email}</Text>
              <Text>Created: {user.timestamp}</Text>
              {/* Delete button for each user */}
              <Button title="Delete User" onPress={() => deleteUser(user.id)} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text>No users to display...</Text> // Display loading message while data is being fetched
      )}
    </View>
  );
}