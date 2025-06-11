import React, { useLayoutEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Index: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();

  // --- Hooks ---
  useLayoutEffect(() => {
    // Hide the header for a cleaner landing screen
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // --- Render Logic ---
  return (
    <View style={styles.container}>
      <Image
        // IMPORTANT: Replace with the correct relative path to your logo
        source={require("/Users/evanwright/personal-projects/AccuAim/AccuAimApp/assets/images/Screenshot 2024-12-30 at 6.45.08 PM.png")} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>AccuAim</Text>
      <Text style={styles.subtitle}>Perfect your practice. Track your progress.</Text>

      {/* Login Button (Primary Action) */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/Login")}
      >
        <Ionicons name="log-in-outline" size={24} color="#121212" />
        <Text style={styles.primaryButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Sign Up Button (Secondary Action) */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/SignUp")}
      >
        <Ionicons name="person-add-outline" size={22} color="#F1C40F" />
        <Text style={styles.secondaryButtonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center', // This is the key change to center the content block
    alignItems: 'center',
    paddingHorizontal: 25, // Add padding for content spacing from edges
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#B0B0B0',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 60, // Creates space between the text and the buttons
  },
  primaryButton: {
    backgroundColor: '#F1C40F',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    width: '100%', // Makes button fill container width
    marginBottom: 15, // Space between buttons
  },
  primaryButtonText: {
    color: '#121212',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    width: '100%', // Makes button fill container width
    borderWidth: 1.5,
    borderColor: '#F1C40F',
  },
  secondaryButtonText: {
    color: '#F1C40F',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default Index;