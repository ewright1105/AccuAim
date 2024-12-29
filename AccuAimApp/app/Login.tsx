import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Link } from 'expo-router';

// Add type definition for router paths

const Login = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
  
    if (!trimmedEmail) {
      Alert.alert("Input Error", "Please enter an email.");
      return;
    }
  
    try {
      console.log("Attempting login...");
      const response = await fetch('http://127.0.0.1:4949/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: trimmedEmail }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
      console.log("Server response:", data); // Log the full response
  
      if (data && data.id) {
        console.log("Attempting navigation to:", `/${data.id}`);
        
        router.push(`/${data.id}`);

      } else {
        Alert.alert("Error", "User not found or invalid credentials.");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      Alert.alert("Error", "An error occurred while checking the user. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    width: '100%',
    paddingHorizontal: 10,
  },
});

export default Login;