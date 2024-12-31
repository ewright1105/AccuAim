// Login.tsx
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRouter } from 'expo-router'; // For navigation
import { useAuth } from './AuthContext'; // Import useAuth for authentication context

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>(''); // Type the email state as a string
  const [isLoading, setIsLoading] = useState<boolean>(false); // Add loading state
  const { login } = useAuth(); // Use the login function from AuthContext
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

  // Handle login form submission
  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert("Input Error", "Please enter a valid email.");
      return;
    }

    setIsLoading(true); // Set loading state to true

    try {
      const response = await fetch('http://127.0.0.1:4949/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: trimmedEmail }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.text();

      try {
        const parsedData = JSON.parse(data);

        if (parsedData.message && parsedData.message === 'User not found') {
          Alert.alert('Error', 'User not found or invalid credentials.');
        } else if (parsedData.id) {
          // Update the global auth context with user's data (name, email, id, etc.)
          login({ id: parsedData.id, email: parsedData.email, name: parsedData.name });

          // Navigate to the Landing screen after successful login
          router.push('/LandingScreen');
        } else {
          Alert.alert('Error', 'Invalid response from server.');
        }
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      Alert.alert('Error', 'An error occurred while checking the user. Please try again.');
    } finally {
      setIsLoading(false); // Reset loading state after request
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
        placeholderTextColor="#F1C40F"
      />

      <Button
        title={isLoading ? 'Logging In...' : 'Login'}
        onPress={handleLogin}
        color="#F1C40F"
        disabled={isLoading} // Disable button while loading
      />
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
