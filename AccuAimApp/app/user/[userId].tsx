import {
  Text, View, ScrollView, Button, TextInput, Alert,
  StyleSheet, TouchableOpacity
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import React from "react";
import { useAuth } from "../AuthContext";

export default function UserDetails() {
  type User = {
    UserID: number;
    email: string;
    name: string;
    timestamp: string;
  };

  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { updateUserName } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Profile
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  // Password Change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Delete Account
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "User Settings",
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
          <Text style={{ color: "#F1C40F", fontSize: 26 }}>←</Text>
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
    }
  }, [userId]);

  const fetchUserDetails = async (id: string | string[]) => {
    try {
      const response = await fetch(`http://127.0.0.1:4949/user/${id}`);
      const data = await response.json();
      if (data?.length > 0) {
        const [UserID, email, name, timestamp] = data;
        setUser({ UserID, email, name, timestamp });
      } else {
        setError("User not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load user details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editedName || !editedEmail) {
      Alert.alert("Missing Info", "Name and email are required.");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:4949/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserID: user?.UserID,
          name: editedName.trim(),
          email: editedEmail.trim(),
        }),
      });

      const result = await response.text();
      if (result.includes("Error")) {
        Alert.alert("Update Failed", result.replace(/[".]/g, ""));
      } else {
        updateUserName(editedName);
        fetchUserDetails(userId);
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not update profile.");
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Too Short", "Password must be at least 8 characters.");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:4949/user/${user.UserID}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const result = await response.json();
      if (result.includes("Error")) {
        Alert.alert("Error", result);
      } else {
        Alert.alert("Success", "Password changed successfully.");
        setIsChangingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Failed", "Could not change password.");
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:4949/user/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserID: user.UserID, password }),
      });

      const result = await response.json();
      if (result.includes("Error")) {
        Alert.alert("Error", result);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Failed", "Could not delete account.");
    }
  };

  if (loading) {
    return <CenteredText message="Loading..." />;
  }

  if (error) {
    return (
      <CenteredText message={error}>
        <Button title="Go Back" onPress={() => router.back()} />
      </CenteredText>
    );
  }

  return (
  <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
    <Text style={styles.header}>Account Info</Text>

    {user && (
      <View style={styles.card}>
        <Detail label="User ID" value={user.UserID.toString()} />
        <Detail label="Name" value={user.name} />
        <Detail label="Email" value={user.email} />
        <Detail label="Created On" value={user.timestamp} />
      </View>
    )}

    {isEditing && (
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Edit Profile</Text>
        <TextInput
          style={styles.input}
          placeholder="New Name"
          value={editedName}
          onChangeText={setEditedName}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="New Email"
          value={editedEmail}
          onChangeText={setEditedEmail}
          keyboardType="email-address"
          placeholderTextColor="#888"
        />
        <View style={styles.buttonRow}>
          <ActionButton label="Save" onPress={handleUpdateProfile} />
          <ActionButton label="Cancel" onPress={() => setIsEditing(false)} secondary />
        </View>
      </View>
    )}

    {isChangingPassword && (
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Change Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <View style={styles.buttonRow}>
          <ActionButton label="Update" onPress={handlePasswordChange} />
          <ActionButton label="Cancel" onPress={() => setIsChangingPassword(false)} secondary />
        </View>
      </View>
    )}

    {isConfirmingDelete && (
      <View style={styles.card}>
        <Text style={[styles.cardHeader, { color: 'red' }]}>Confirm Delete Account</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <View style={styles.buttonRow}>
          <ActionButton label="Delete" onPress={handleDeleteUser} danger />
          <ActionButton label="Cancel" onPress={() => setIsConfirmingDelete(false)} secondary />
        </View>
      </View>
    )}

    {!isEditing && !isChangingPassword && !isConfirmingDelete && (
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Actions</Text>
        <ActionButton label="Edit Profile" onPress={() => {
          setEditedName(user?.name ?? "");
          setEditedEmail(user?.email ?? "");
          setIsEditing(true);
        }} />
        <ActionButton label="Change Password" onPress={() => setIsChangingPassword(true)} />
        <ActionButton label="Sign Out" onPress={() => router.push("/")} />
        <ActionButton label="Delete Account" onPress={() => setIsConfirmingDelete(true)} danger />
      </View>
    )}
  </ScrollView>
);

}

// --- Components & Styles ---

const Detail = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailText}>{value}</Text>
  </View>
);

const CenteredText = ({ message, children }: { message: string, children?: React.ReactNode }) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>{message}</Text>
    {children}
  </View>
);

const ActionButton = ({ label, onPress, secondary = false, danger = false }: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.actionButton,
      secondary && styles.buttonSecondary,
      danger && styles.buttonDanger,
    ]}
  >
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F1C40F",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F1C40F",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#2C2C2C",
    borderRadius: 8,
    padding: 10,
    color: "#F1C40F",
    borderColor: "#F1C40F",
    borderWidth: 1,
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#888",
  },
  detailText: {
    fontSize: 16,
    color: "#F1C40F",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionButton: {
    backgroundColor: "#F1C40F",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 6,
  },
  buttonSecondary: {
    backgroundColor: "#555",
  },
  buttonDanger: {
    backgroundColor: "#E74C3C",
  },
  buttonText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 16,
  },
});
