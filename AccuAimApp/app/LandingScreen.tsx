
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
                <TouchableOpacity onPress={() => router.push(`/user/${user.UserID}`)}>
                    <Ionicons name="person-outline" size={28} color="#F1C40F" />
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
                <TouchableOpacity style={styles.sessionsButton} onPress={() => router.push('/UserSessions')}>
                    <Ionicons name="calendar-outline" size={20} color="#121212" style={styles.icon} />
                    <Text style={styles.buttonText}>Your Sessions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sessionsButton} onPress={() => router.push('/CreateSession')}>
                    <Ionicons name="add-circle" size={20} color="#121212" style={styles.icon} />
                    <Text style={styles.buttonText}> New Session </Text>
                </TouchableOpacity>
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
    sessionsButton: {
        backgroundColor: '#F1C40F',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 20,
        flexDirection: 'row', // Align icon and text horizontally
        alignItems: 'center',
    },
    icon: {
        marginRight: 10, // Space between the icon and text
    },
    buttonText: {
        color: '#121212',
        fontSize: 18,
        fontWeight: 'bold',
    },
    });

    export default LandingScreen;
