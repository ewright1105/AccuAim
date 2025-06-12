import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SignUp: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const navigation = useNavigation();

  // --- Hooks ---
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Create Account",
      headerStyle: { backgroundColor: '#121212' },
      headerTitleStyle: { color: '#FFFFFF' },
      headerShadowVisible: false,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 15 }}
        >
          <Ionicons name="arrow-back" size={28} color="#F1C40F" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // --- Handlers ---
  const handleSignUp = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // --- Input Validation ---
    if (!trimmedName || !trimmedEmail || !trimmedPassword || !confirmPassword) {
      Alert.alert("Input Error", "All fields are required.");
      return;
    }
    if (trimmedPassword !== confirmPassword.trim()) {
      Alert.alert("Password Error", "Passwords do not match.");
      return;
    }
    if (trimmedPassword.length < 8) {
      Alert.alert("Password Error", "Password must be at least 8 characters long.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Input Error", "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      // NOTE: Assumes a dedicated endpoint for registration, e.g., '/user/register'
      const response = await fetch('http://172.20.10.6:4949/user/register', {
        method: 'POST',
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password: trimmedPassword }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific server-side errors, e.g., "Email already in use"
        throw new Error(data.message || 'An error occurred during sign-up.');
      }
      
      Alert.alert(
        "Success!",
        "Your account has been created. Please log in.",
        [{ text: "OK", onPress: () => router.push('/Login') }]
      );

    } catch (error: any) {
      console.error("Error signing up:", error);
      Alert.alert('Sign-up Failed', error.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Logic ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <Text style={styles.header}>Create Your Account</Text>
        <Text style={styles.subHeader}>Join AccuAim to track your progress.</Text>

        {/* --- Name Input --- */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={22} color="#B0B0B0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#B0B0B0"
          />
        </View>

        {/* --- Email Input --- */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={22} color="#B0B0B0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#B0B0B0"
            autoCapitalize="none"
          />
        </View>

        {/* --- Password Input --- */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={22} color="#B0B0B0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password (min. 8 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholderTextColor="#B0B0B0"
          />
        </View>

        {/* --- Confirm Password Input --- */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={22} color="#B0B0B0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            placeholderTextColor="#B0B0B0"
          />
        </View>

        {/* --- Sign-Up Button --- */}
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#121212" />
          ) : (
            <Text style={styles.signUpButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* --- Login Link --- */}
        <View style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/Login')}>
                <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  innerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20, // Add padding for scroll view
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: '#B0B0B0',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    width: '100%',
    height: 55,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: '#F1C40F',
    borderRadius: 12,
    width: '100%',
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpButtonText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  loginLink: {
    color: '#F1C40F',
    fontSize: 14,
    fontWeight: 'bold',
  }
});

export default SignUp;