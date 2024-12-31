
import React, { useEffect, useLayoutEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from './AuthContext'; // Import the useAuth hook
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for settings icon


const LandingScreen: React.FC = () => {
    const { user, logout } = useAuth(); // Access the logged-in user and logout function
    const router = useRouter();
    const navigation = useNavigation();
    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Dashboard',
            headerRight: () => (
                // Conditionally render the settings icon only if 'user' is not null
                user ? (
                <TouchableOpacity onPress={() => router.push(`/user/${user.id}`)}>
                    <Ionicons name="settings-outline" size={28} color="#F1C40F" />
                </TouchableOpacity>
                ) : null
            ),
            headerLeft: () => (
                // Conditionally render the settings icon only if 'user' is not null
                user ? (
                    <Button
                    title="Logout"
                    onPress={() => {
                    logout(); // Clear user data from context
                    router.push('/'); // Redirect to login screen
                    }}
                    color="red"
                />
                ) : null
            ),
        });
    }, [navigation, router, user]);

    useEffect(() => {
        if (!user) {
        // Redirect to login if no user is logged in
        router.push('/');
        }
    }, [user, router]);

    return (
        <View style={styles.container}>
        {user ? (
            <>
            {/* Display the user's name in the welcome message */}
            <Text style={styles.title}>Welcome, {user.name}!</Text>
            <Button title="Your Sessions" onPress={() => router.push('/UserSessions')} color="#F1C40F" />
            </>
        ) : (
            <Text style={styles.subtitle}>You need to be logged in to view this page.</Text>
        )}
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
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#F1C40F',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        color: '#B0B0B0',
        marginBottom: 40,
    },
    });

    export default LandingScreen;
