import { useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
import { View, Text, Button, Alert, TextInput, StyleSheet, TouchableOpacity } from "react-native";

export default function SignUp() {
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newUserId, setNewUserId] = useState(null);
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "AccuAim",
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

  type User = {
    id: number;
    email: string;
    name: string;
    timestamp: string;
  };

  // Function to fetch the new user ID
  const updateNewUserId = async () => {
    try {
      const response = await fetch("http://172.31.0.87:4949/");
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
    const password = newPassword.trim();
    const confirmPasswordTrimmed = confirmPassword.trim();

    // Check if all fields are filled
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Input Error", "All fields are required.");
      return;
    }

    // Check if passwords match
    if (password !== confirmPasswordTrimmed) {
      Alert.alert("Password Error", "Passwords do not match.");
      return;
    }

    // Password strength validation (simple example: minimum 8 characters)
    if (password.length < 8) {
      Alert.alert("Password Error", "Password must be at least 8 characters.");
      return;
    }

    try {
      const response = await fetch("http://172.31.0.87:4949/", {
        method: "POST",
        body: JSON.stringify({ name, email, password }), // Include password
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.text(); // Get the response as plain text to handle errors from the server

      // Check for errors in the response
      if (data.includes("Error")) {
        Alert.alert("An Error has Occurred!", data.replace('"', "").replace('."', "."));
      } else {
        // If no error, reset fields and fetch user ID
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setConfirmPassword("");
        const userId = await updateNewUserId(); // Fetch the new user ID

        if (userId) {
          router.push(`/Login`); // Navigate to the new user's page using the retrieved user ID
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
        placeholderTextColor="#F1C40F"
        value={newName}
        onChangeText={setNewName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        placeholderTextColor="#F1C40F"
        value={newEmail}
        onChangeText={setNewEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        placeholderTextColor="#F1C40F"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        placeholderTextColor="#F1C40F"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <Button
        title="Add User"
        onPress={addUser}
        color="#F1C40F"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212", 
  },
  input: {
    height: 40,
    borderColor: "#F1C40F", 
    borderWidth: 1,
    marginBottom: 10,
    width: "100%",
    paddingHorizontal: 10,
    color: "#F1C40F", 
  },
});
