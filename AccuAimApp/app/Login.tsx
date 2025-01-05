import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRouter } from 'expo-router'; // For navigation
import { useAuth } from './AuthContext'; // Import useAuth for authentication context

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>(''); // Email state
  const [password, setPassword] = useState<string>(''); // Password state
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
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
    const trimmedPassword = password.trim();

    // Validate input
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert("Input Error", "Please enter both email and password.");
      return;
    }

    setIsLoading(true); // Set loading state to true

    try {
      const response = await fetch('http://127.0.0.1:4949/user/login', {
        method: 'POST',
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
    
      console.log(data);
    
      if (data == null || data.message === 'Invalid credentials') {
        Alert.alert("Error", "Invalid email or password. Please try again.");
      } else if (data.UserID) {
        login({UserID: data.UserID, email: data.email, name: data.name });
        router.push('/LandingScreen');
      } else {
        Alert.alert('Error', 'Invalid response from server.');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      Alert.alert('Error', 'An error occurred while checking the user. Please try again.');
    } finally {
      setIsLoading(false);
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

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true} // Hide the password text
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
