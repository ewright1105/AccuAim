import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider } from './AuthContext'; // Import the AuthProvider

const RootLayout: React.FC = () => {
  return (
    // Wrap the entire app with AuthProvider
    <AuthProvider>
      <Stack
      screenOptions={{
        headerBackVisible: false,
        animation: 'none',
        headerStyle: {
          backgroundColor: "#121212",
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
            },
            android: {
              // No need for elevation here, React Navigation handles shadow for Android
            },
          }),
        },
        headerTintColor: "#F1C40F",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 24,
          color: "#F1C40F",
        },
      }}
    />
    </AuthProvider>
  );
};

export default RootLayout;
