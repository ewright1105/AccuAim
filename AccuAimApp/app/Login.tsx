import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';

const Login = () => {
  const [email, setEmail] = useState('');
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

  const handleLogin = () => {
    const trimmedEmail = email.trim();
  
    if (!trimmedEmail) {
      Alert.alert("Input Error", "Please enter an email.");
      return;
    }

    fetch('http://127.0.0.1:4949/users/login', {
      method: 'POST',
      body: JSON.stringify({ email: trimmedEmail }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.text()) 
      .then((data) => {
        try {
          const parsedData = JSON.parse(data); 
          // Check if the response contains an error message
          if (parsedData.message && parsedData.message === "User not found") {
            Alert.alert("Error", "User not found or invalid credentials.");
          } else if (parsedData.id) {
            // If the response contains user data, navigate to the user's profile
            router.push(`/${parsedData.id}`);
          } else {
            // Handle any other unexpected responses
            Alert.alert("Error", "Invalid response from server.");
          }
        } catch (error) {
          console.error("Error parsing JSON response:", error);
          Alert.alert("Error", "An unexpected error occurred.");
        }
      })
      .catch((error) => {
        console.error("Error checking user:", error);
        Alert.alert("Error", "An error occurred while checking the user. Please try again.");
      });
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
        placeholderTextColor="#F1C40F" 
      />

      <Button title="Login" onPress={handleLogin} color="#F1C40F" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212', 
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F1C40F',
    marginBottom: 20,
  },
  input: {
    height: 45,
    borderColor: '#F1C40F', 
    borderWidth: 1,
    marginBottom: 15,
    width: '100%',
    paddingHorizontal: 10,
    color: '#F1C40F', 
  },
});

export default Login;