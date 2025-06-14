import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider } from './AuthContext'; // Import the AuthProvider

const RootLayout: React.FC = () => {
  return (
    <AuthProvider>
      <Stack
      screenOptions={{
        gestureEnabled: false,
        headerBackVisible: false,
        animation: 'fade',
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
