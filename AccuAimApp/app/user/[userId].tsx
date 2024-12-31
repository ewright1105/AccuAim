import { Text, View, ScrollView, Button, TextInput, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import React from "react";

export default function UserDetails() {

  type User = {
    id: number;
    email: string;
    name: string;
    timestamp: string;
  };
  const { userId } = useLocalSearchParams(); // Retrieve the user ID from the route parameters
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
    timestamp: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Settings",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 15 }}
        >
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

  const [editUser, setEditUser] = useState<User | null>(null); // User being edited
  const [editedName, setEditedName] = useState(""); // New name for edit
  const [editedEmail, setEditedEmail] = useState(""); // New email for edit

  const fetchUserDetails = async (userId: String | String[]) => {
    try {
      const response = await fetch(`http://127.0.0.1:4949/user/${userId}`);
      const data = await response.json();

      // Now handle the API response correctly
      if (data && data.length > 0) {
        const userData = data;
        setUser({
          id: userData[0], 
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
    setEditUser(null);  // Clear the editUser state to exit editing mode
    setEditedName("");  // Reset the edited name field
    setEditedEmail(""); // Reset the edited email field
  };

// Function to update an existing user
const updateUser = () => {
  if (editUser) {
    const name = editedName.trim();
    const email = editedEmail.trim();

    if (name && email) {
      fetch("http://127.0.0.1:4949/", {
        method: "PUT",
        body: JSON.stringify({
          UserID: editUser.id,
          name,
          email,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.text()) // Using `.text()` to capture response as plain text
        .then((data) => {
        
          if (data.includes("Error")) {
            //remove quotations
            data = data.replace('"',"")
            data = data.replace('."', '.')
            Alert.alert("An Error has Occured!",data); // Show the error message from the server
          } else {
            fetchUserDetails(userId); // Refresh the users list
            cancelEdit()
          }
        })
        .catch((error) => {
          console.error("Error adding user:", error);
          Alert.alert("Error", "Failed to add user. Please try again.");
        });
        } else {
        Alert.alert("Input Error", "Name and email are required.");
        }
      };
    }

    // Function to delete a user
const deleteUser = (id: number) => {
  fetch("http://127.0.0.1:4949/", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      UserID: id,  
    }),
  })
    .then((response) => response.json())  
    .then(data => {
      data.trim('"','')
      data.trim('."', '')
      if(data.includes('Error')){
        Alert.alert("Error Deleting User", data)
      }
      else{
        router.push('/') 
      }
    })
    .catch((error) => {
      console.error("Error deleting user:", error);
    });
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
            <Text style={styles.detailText}>{user.id}</Text>
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

          {/* Editing user details */}
          {editUser && (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.input}
                placeholder="Update name"
                value={editedName}
                onChangeText={setEditedName}
                placeholderTextColor="#F1C40F" // Light yellow placeholder
              />
              <TextInput
                style={styles.input}
                placeholder="Update email"
                value={editedEmail}
                onChangeText={setEditedEmail}
                keyboardType="email-address"
                placeholderTextColor="#F1C40F" // Light yellow placeholder
              />
              <Button title="Update User" onPress={updateUser} color="#F1C40F" />
              <Button title="Cancel" onPress={cancelEdit} color="red" />
            </View>
          )}

          {/* Buttons to Edit or Delete */}
          {!editUser && (
            <>
              <Button
                title="Edit User"
                onPress={() => {
                  setEditUser(user);
                  setEditedName(user.name);
                  setEditedEmail(user.email);
                }}
                color="#F1C40F" // Yellow color for button
              />
              <Button title="Sign Out" onPress={() => router.push('/')} color="#F1C40F" />
              <Button
                title="Delete User"
                onPress={() => deleteUser(user.id)}
                color="red" // Red color for delete
              />
            </>
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
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#F1C40F", 
  },
  errorText: {
    fontSize: 18,
    color: "red",
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
  input: {
    height: 40,
    borderColor: "#F1C40F", 
    borderWidth: 1,
    marginBottom: 10,
    width: "100%",
    paddingHorizontal: 10,
    color: "#F1C40F", 
  },
});