import { Text, View, Button, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { useAuth } from "./AuthContext";
import { useRoute } from "@react-navigation/native";

export default function ActiveSession() {
    interface Shot {
        ShotID: number;
        BlockID: number;
        ShotTime: string;
        ShotPositionX: string; // Store as string to match the API response
        ShotPositionY: string;
        Result: "Made" | "Missed";
      }
    const route = useRoute();
    const router = useRouter();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { SessionID } = route.params as { SessionID: number };
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [shots, setShots] = useState<Shot[] | null>(null);
    

    useLayoutEffect(() => {
        navigation.setOptions({
        title: "You are in a Shooting Session",
        });
    }, [navigation]);

    useEffect(() => {
        if (user && SessionID) {
            fetchSessionData(Number(user.UserID), SessionID);
        } else {
            setError("User not logged in or invalid session ID.");
            setLoading(false);
        }
        }, [user, SessionID]);
    
        const fetchSessionData = async (userId: number, sessionId: number) => {
        try {
            setLoading(true);
            const apiUrl = `http://127.0.0.1:4949/user/${userId}/sessions/${sessionId}`;
            const response = await fetch(apiUrl);
    
            if (!response.ok) {
            throw new Error("Failed to fetch session data.");
            }
    
            const data: Shot[] = await response.json();
            setShots(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching session data:", err);
            setError("Error fetching session data.");
            setLoading(false);
        }
        };

    return (
        <View style={styles.container}>
        <Image
            source={require("/Users/evanwright/personal-projects/AccuAim/AccuAimApp/assets/images/Screenshot 2024-12-30 at 6.45.08 PM.png")} // Adjust this path to match your logo file location
            style={styles.logo}
            resizeMode="contain"
        />

        {/* End Session Button */}
        <TouchableOpacity
            style={styles.button}
            onPress={async () => {
                try {
                    const response = await fetch(`http://127.0.0.1:4949/user/${user?.UserID}/sessions/${SessionID}/active-session`, {
                        method: 'PUT',
                        body: JSON.stringify({ SessionID: SessionID }), // Sending SessionID in the body
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                
                    if (!response.ok) {
                        throw new Error(`Failed to update session: ${response.statusText}`);
                    }
                
                    const data = await response.json();
                    console.log(data);
                } catch (error) {
                    console.error("Error during PUT request:", error);
                    // Optionally show an alert or update your UI with the error
                }
            router.push("/Dashboard"); // Navigate to the Dashboard after ending the session
            }}
        >
            <Text style={styles.buttonText}>End Session</Text>
        </TouchableOpacity>
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212", 
        paddingHorizontal: 20,
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#F1C40F", 
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 40,
        color: "#B0B0B0", 
    },
    button: {
        backgroundColor: "#F1C40F", 
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginBottom: 20,
        width: "80%",
        alignItems: "center",
    },
    signUpButton: {
        backgroundColor: "#FFC107", 
    },
    buttonText: {
        color: "#121212",
        fontSize: 18,
        fontWeight: "bold",
    },
    });