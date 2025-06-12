import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from './AuthContext';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const navigation = useNavigation();

    // Updated state to include raw shot counts
    const [stats, setStats] = useState({
        allTimeAccuracy: '...',
        lastSessionAccuracy: '...',
        streak: 0,
        totalMade: 0,
        totalPlanned: 0,
    });

    // --- Hooks ---
    useLayoutEffect(() => {
        // ... (No changes needed in this hook)
        navigation.setOptions({
            title: 'Home',
            headerStyle: { backgroundColor: '#121212' },
            headerTitleStyle: { color: '#FFFFFF' },
            headerRight: () =>
                user ? (
                    <TouchableOpacity onPress={() => router.push(`/user/${user.UserID}`)} style={{ marginRight: 10 }}>
                        <Ionicons name="person-circle-outline" size={30} color="#F1C40F" />
                    </TouchableOpacity>
                ) : null,
            headerLeft: () =>
                user ? (
                    <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 15 }}>
                         <Ionicons name="log-out-outline" size={30} color="#E74C3C" />
                    </TouchableOpacity>
                ) : null,
        });
    }, [navigation, router, user]);

    useEffect(() => {
        if (!user) {
            router.replace('/');
            return;
        }
        const fetchDashboardStats = async () => {
            try {
                const response = await fetch(`http://172.20.10.6:4949/user/${user.UserID}/dashboard`);
                if (!response.ok) throw new Error('Failed to fetch stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
                setStats({ 
                    allTimeAccuracy: 'Error', lastSessionAccuracy: 'Error', 
                    streak: -1, totalMade: 0, totalPlanned: 0 
                });
            }
        };
        fetchDashboardStats();
    }, [user, router]);

    const handleLogout = () => {
        logout();
    };
    
    // --- Dynamic variables for conditional rendering ---
    const isStreakActive = stats.streak > 0;
    const streakIconColor = isStreakActive ? '#F57C00' : '#666666';

    if (!user) {
        return null;
    }

    // --- Render Logic ---
    return (
        <ScrollView style={styles.container}>
            <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>Welcome, {user.name}!</Text>
                <Text style={styles.greetingSubtext}>Here's your progress overview.</Text>
            </View>

            {/* --- All-Time Accuracy Hero Card --- */}
            <View style={styles.heroCard}>
                <Ionicons name="shield-checkmark" size={36} color="#3498DB" />
                <View style={styles.heroTextContainer}>
                    <Text style={styles.heroValue}>{stats.allTimeAccuracy}</Text>
                    <Text style={styles.heroLabel}>All-Time Accuracy</Text>
                    <Text style={styles.heroSubLabel}>{`${stats.totalMade} / ${stats.totalPlanned} shots made`}</Text>
                </View>
            </View>

            {/* --- Secondary Stats Row --- */}
            <View style={styles.statsRow}>
                {/* Streak Card */}
                <View style={[styles.statCard, isStreakActive && styles.streakCardActive]}>
                    <Ionicons name="flame" size={24} color={streakIconColor} />
                    <Text style={styles.statValue}>{stats.streak}</Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                </View>

                {/* Last Session Card */}
                <View style={styles.statCard}>
                    <Ionicons name="trending-up-outline" size={24} color="#F1C40F" />
                    <Text style={styles.statValue}>{stats.lastSessionAccuracy}</Text>
                    <Text style={styles.statLabel}>Last Session</Text>
                </View>
            </View>

            {/* --- Main Call to Action (CTA) --- */}
            <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/CreateSession')}>
                <Ionicons name="add-circle" size={28} color="#121212" />
                <Text style={styles.ctaButtonText}>Start New Session</Text>
            </TouchableOpacity>
            
            <View style={styles.menuGrid}>
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/UserSessions')}>
                    <Ionicons name="time-outline" size={40} color="#F1C40F" />
                    <Text style={styles.menuItemText}>Past Sessions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Leaderboard')}>
                    <Ionicons name="trophy-outline" size={40} color="#F1C40F" />
                    <Text style={styles.menuItemText}>Leaderboard</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingHorizontal: 20,
    },
    greetingContainer: {
        paddingTop: 30,
        paddingBottom: 20,
    },
    greetingText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    greetingSubtext: {
        fontSize: 18,
        color: '#B0B0B0',
        marginTop: 4,
    },
    // Styles for the new "hero" card
    heroCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
        borderColor: '#3498DB', // A distinct color for the main hero card
        borderWidth: 1.5,
    },
    heroTextContainer: {
        marginLeft: 15,
    },
    heroValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    heroLabel: {
        fontSize: 16,
        color: '#B0B0B0',
    },
    heroSubLabel: {
        fontSize: 12,
        color: '#888888',
        marginTop: 4,
    },
    // Styles for the row containing the secondary cards
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
    },
    streakCardActive: {
        borderColor: '#F57C00',
        borderWidth: 1.5,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#B0B0B0',
        marginTop: 4,
    },
    ctaButton: {
        backgroundColor: '#F1C40F',
        borderRadius: 12,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    ctaButtonText: {
        color: '#121212',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    menuGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    menuItem: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 20,
        width: '48%',
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
    },
    menuItemText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
    },
});

export default Dashboard;