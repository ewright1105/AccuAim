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
  Platform
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useAuth } from './AuthContext';
import { Ionicons } from '@expo/vector-icons';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  // --- Hooks ---
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Login",
      headerStyle: { backgroundColor: '#121212' },
      headerTitleStyle: { color: '#FFFFFF' },
      headerShadowVisible: false, // Removes the shadow on iOS
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

  // Handle login form submission
  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert("Input Error", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://172.20.10.6:4949/user/login', {
        method: 'POST',
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
    
      if (data == null || data.message === 'Invalid credentials') {
        Alert.alert("Login Failed", "Invalid email or password. Please try again.");
      } else if (data.UserID) {
        login({ UserID: data.UserID, email: data.email, name: data.name });
        router.replace('/Dashboard'); // Use replace to prevent going back to login
      } else {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Network Error', 'Could not connect to the server. Please check your connection.');
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
      <View style={styles.innerContainer}>
        <Text style={styles.header}>Welcome Back</Text>
        <Text style={styles.subHeader}>Log in to continue your journey.</Text>

        {/* --- Email Input --- */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={22} color="#B0B0B0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
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
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholderTextColor="#B0B0B0"
          />
        </View>

        {/* --- Login Button --- */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#121212" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* --- Extra Links --- */}
        <View style={styles.linksContainer}>
            <TouchableOpacity>
                <Text style={styles.linkText}>Forgot Password?</Text> 
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/SignUp')}>
                <Text style={styles.linkText}>Create Account</Text>
            </TouchableOpacity>
        </View>
      </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  loginButton: {
    backgroundColor: '#F1C40F',
    borderRadius: 12,
    width: '100%',
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  linkText: {
    color: '#F1C40F',
    fontSize: 14,
    fontWeight: '500',
  }
});

export default Login;