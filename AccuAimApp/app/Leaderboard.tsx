import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from './AuthContext';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type UserStat = {
  UserID: number;
  FullName: string;
  TotalMade: number;
  TotalPlanned: number;
  AccuracyPercent: string;
};

const LeaderboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  const [leaderboard, setLeaderboard] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Leaderboard',
      headerRight: () =>
        user ? (
          <TouchableOpacity onPress={() => router.push(`/user/${user.UserID}`)}>
            <Ionicons name="person-outline" size={28} color="#F1C40F" />
          </TouchableOpacity>
        ) : null,
      headerLeft: () =>
        user ? (
          <TouchableOpacity onPress={() => {
            router.back();
          }}>
            <Text style={{ color: "#F1C40F", fontSize: 26 }}>←</Text>
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, router, user]);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      fetch('http://127.0.0.1:4949/leaderboard')
        .then((res) => res.json())
        .then((data) => {
          setLeaderboard(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching leaderboard:', err);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏅 All-Time Accuracy</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#F1C40F" />
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.UserID.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <View style={styles.userInfo}>
                <Text style={styles.name}>{item.FullName}</Text>
                <Text style={styles.stats}>
                  Made: {item.TotalMade} / Planned: {item.TotalPlanned}
                </Text>
                <Text style={styles.accuracy}>Accuracy: {item.AccuracyPercent}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F1C40F',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  rank: {
    fontSize: 24,
    color: '#F1C40F',
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
  },
  userInfo: {
    marginLeft: 10,
    flex: 1,
  },
  name: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  stats: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  accuracy: {
    fontSize: 14,
    color: '#7FFF00',
    marginTop: 2,
  },
});

export default LeaderboardScreen;
