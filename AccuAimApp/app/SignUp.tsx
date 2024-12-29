import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, Button, Alert, TextInput, StyleSheet } from "react-native";

export default function SignUp() {
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newUserId, setNewUserId] = useState(null);
  const router = useRouter();

  type User = {
    id: number;
    email: string;
    name: string;
    timestamp: string;
  };
  

  // Function to fetch the new user ID
  const updateNewUserId = async () => {
    try {
      const response = await fetch("http://127.0.0.1:4949/users");
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      
      const usersList = data.map((userData: [number, string, string, string]) => ({
        id: userData[0],
        email: userData[1],
        name: userData[2],
        timestamp: userData[3],
      }));

      const user = usersList.find((user: User) => user.email === newEmail);
      if (user) {
        setNewUserId(user.id);
        return user.id; // Return the user ID after finding it
      } else {
        console.error("User not found in the users list.");
        throw new Error("User not found.");
      }
    } catch (error) {
      console.error("Error fetching users data:", error);
      Alert.alert("Error", "Failed to fetch user data.");
      return null;
    }
  };

  const addUser = async () => {
    const name = newName.trim();
    const email = newEmail.trim();

    // Check if both fields are filled
    if (!name || !email) {
      Alert.alert("Input Error", "Name and email are required.");
      return;
    }

    try {
      console.log("Attempting to add user...");
      const response = await fetch("http://127.0.0.1:4949/users", {
        method: "POST",
        body: JSON.stringify({ name, email }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.text(); // Get the response as plain text to handle errors from the server
      console.log("Server response:", data); // Log the full response

      // Check for errors in the response
      if (data.includes("Error")) {
        Alert.alert("An Error has Occurred!", data.replace('"', "").replace('."', "."));
      } else {
        // If no error, reset fields and fetch user ID
        setNewName("");
        setNewEmail("");
        const userId = await updateNewUserId(); // Fetch the new user ID

        if (userId) {
          router.push(`/${userId}`); // Navigate to the new user's page using the retrieved user ID
        } else {
          Alert.alert("Error", "Failed to retrieve user ID.");
        }
      }
    } catch (error) {
      console.error("Error adding user:", error);
      Alert.alert("Error", "An error occurred while adding the user. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter name"
        value={newName}
        onChangeText={setNewName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        value={newEmail}
        onChangeText={setNewEmail}
        keyboardType="email-address"
      />
      <Button title="Add User" onPress={addUser} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    width: "100%",
    paddingHorizontal: 10,
  },
});
