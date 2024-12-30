import { Text, View, Button, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useLayoutEffect } from "react";
import { useNavigation, useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "AccuAim",
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("/Users/evanwright/personal projects/AccuAim/AccuAimApp/assets/images/Screenshot 2024-12-30 at 6.45.08 PM.png")} // Adjust this path to match your logo file location
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome to AccuAim</Text>
      <Text style={styles.subtitle}>Please log in or sign up to get started</Text>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          router.push("/Login");
        }}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[styles.button, styles.signUpButton]}
        onPress={() => {
          router.push("/SignUp");
        }}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
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