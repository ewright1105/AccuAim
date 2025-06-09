import { Text, View, ScrollView, Button, TextInput, Alert, StyleSheet, TouchableOpacity } from "react-native";
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

  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const { updateUserName } = useAuth();

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Delete account states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Settings",
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
          <Text style={{ color: "#F1C40F", fontSize: 26 }}>←</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
    }
  }, [userId]);

  const fetchUserDetails = async (userId: String | String[]) => {
    try {
      const response = await fetch(`http://172.31.0.87:4949/user/${userId}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const userData = data;
        setUser({
          UserID: userData[0],
          email: userData[1],
          name: userData[2],
          timestamp: userData[3],
        });
      } else {
        setError("User not found");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditUser(null);
    setEditedName("");
    setEditedEmail("");
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handlePasswordChange = () => {
    if (!user) {
      Alert.alert("Error", "User information is missing.");
      return;
    }
  
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Password Mismatch", "New passwords do not match.");
      return;
    }
  
    if (newPassword.length < 8) {
      Alert.alert("Invalid Password", "New password must be at least 8 characters long.");
      return;
    }
  
    // Proceed with the API call to change the password
    fetch(`http://172.31.0.87:4949/user/${user.UserID}/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })
      .then((response) => {
        return response.json();  // Only parse the JSON if the response is ok
      })
      .then((data) => {
        // Check for errors in the response data
        if (data?.includes("Error")) {
          Alert.alert("Oops!", data || "An unexpected error occurred.");
        } else {
          Alert.alert("Success", "Password updated successfully");
          cancelPasswordChange();  // Assuming this resets or closes the password change form
        }
      })
      .catch((error) => {
        console.error("Error changing password:", error);
        Alert.alert("Error", error.message || "Failed to change password. Please try again.");
      });
  };
  
  

  const updateUser = () => {
    if (editUser) {
      const name = editedName.trim();
      const email = editedEmail.trim();

      if (name && email) {
        fetch(`http://172.31.0.87:4949/user/${userId}`, {
          method: "PUT",
          body: JSON.stringify({
            UserID: editUser.UserID,
            name,
            email,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.text())
          .then((data) => {
            if (data.includes("Error")) {
              
              data = data.replace('"', "").replace('."', '.');
              Alert.alert("Oops!", data);
            } else {
              updateUserName(name);
              fetchUserDetails(userId);
              cancelEdit();
            }
          })
          .catch((error) => {
            console.error("Error adding user:", error);
            Alert.alert("Error", "Failed to add user. Please try again.");
          });
      } else {
        Alert.alert("Input Error", "Name and email are required.");
      }
    }
  };

  const deleteUser = (id: number, password: string) => {
    fetch(`http://172.31.0.87:4949/user/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UserID: id,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        data.trim('"', '');
        data.trim('."', '');
        if (data.includes('Error')) {
          Alert.alert("Oops!", data);
        } else {
          router.push('/');
          setIsConfirmingDelete(false);
        }
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  };

  const handleDeleteUser = () => {
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "The passwords do not match.");
    } else {
      deleteUser(user!.UserID, password);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>User Details</Text>
      {user && (
        <View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID:</Text>
            <Text style={styles.detailText}>{user.UserID}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailText}>{user.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailText}>{user.email}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailText}>{user.timestamp}</Text>
          </View>

          {/* Password Change Section */}
          {isChangingPassword && (
            <View style={styles.passwordChangeContainer}>
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholderTextColor="#F1C40F"
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholderTextColor="#F1C40F"
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
                placeholderTextColor="#F1C40F"
              />
              <Button title="Change Password" onPress={handlePasswordChange} color="#F1C40F" />
              <Button title="Cancel" onPress={cancelPasswordChange} color="gray" />
            </View>
          )}

          {/* Editing user details */}
          {editUser && (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.input}
                placeholder="Update name"
                value={editedName}
                onChangeText={setEditedName}
                placeholderTextColor="#F1C40F"
              />
              <TextInput
                style={styles.input}
                placeholder="Update email"
                value={editedEmail}
                onChangeText={setEditedEmail}
                keyboardType="email-address"
                placeholderTextColor="#F1C40F"
              />
              <Button title="Update User" onPress={updateUser} color="#F1C40F" />
              <Button title="Cancel" onPress={cancelEdit} color="gray" />
            </View>
          )}

          {/* Action Buttons */}
          {!editUser && !isChangingPassword && !isConfirmingDelete && (
            <>
              <Button
                title="Edit User"
                onPress={() => {
                  setEditUser(user);
                  setEditedName(user.name);
                  setEditedEmail(user.email);
                }}
                color="#F1C40F"
              />
              <Button
                title="Change Password"
                onPress={() => setIsChangingPassword(true)}
                color="#F1C40F"
              />
              <Button title="Sign Out" onPress={() => router.push('/')} color="#F1C40F" />
              <Button
                title="Delete User"
                onPress={() => setIsConfirmingDelete(true)}
                color="red"
              />
            </>
          )}

          {/* Confirm password inputs when deleting */}
          {isConfirmingDelete && (
            <View style={styles.deleteConfirmContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#F1C40F"
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor="#F1C40F"
              />
              <Button title="Confirm Deletion" onPress={handleDeleteUser} color="red" />
              <Button title="Cancel" onPress={() => setIsConfirmingDelete(false)} color="gray" />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F1C40F",
    marginBottom: 20,
  },
  detailRow: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F1C40F",
  },
  detailText: {
    fontSize: 16,
    color: "#F1C40F",
  },
  editContainer: {
    marginVertical: 20,
  },
  passwordChangeContainer: {
    marginVertical: 20,
  },
  input: {
    height: 40,
    borderColor: "#F1C40F",
    borderWidth: 1,
    marginBottom: 10,
    width: "100%",
    paddingHorizontal: 10,
    color: "#F1C40F",
  },
  deleteConfirmContainer: {
    marginTop: 20,
  },
});