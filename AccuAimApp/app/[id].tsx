import { Text, View, ScrollView, Button, TextInput, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function UserDetails() {

  type User = {
    id: number;
    email: string;
    name: string;
    timestamp: string;
  };
  const { id } = useLocalSearchParams(); // Retrieve the user ID from the route parameters
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
    timestamp: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const [editUser, setEditUser] = useState<User | null>(null); // User being edited
  const [editedName, setEditedName] = useState(""); // New name for edit
  const [editedEmail, setEditedEmail] = useState(""); // New email for edit

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:4949/users/${id}`);
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
      fetch("http://127.0.0.1:4949/users", {
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
            fetchUserDetails(); // Refresh the users list
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
  fetch("http://127.0.0.1:4949/users", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      UserID: id,  
    }),
  })
    .then((response) => response.json())  
    .then(() => {
      router.back()  // Refresh the users list after deletion
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
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        User Details
      </Text>
      {user && (
        <View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>ID:</Text>
            <Text style={{ fontSize: 16 }}>{user.id}</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Name:</Text>
            <Text style={{ fontSize: 16 }}>{user.name}</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Email:</Text>
            <Text style={{ fontSize: 16 }}>{user.email}</Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Created:</Text>
            <Text style={{ fontSize: 16 }}>{user.timestamp}</Text>
          </View>
          {/* Update input fields if a user is being edited */}
      {editUser && (
        <View style={{ marginVertical: 20 }}>
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 10,
              width: "100%",
              paddingHorizontal: 10,
            }}
            placeholder="Update name"
            value={editedName}
            onChangeText={setEditedName}
          />
          <TextInput
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 10,
              width: "100%",
              paddingHorizontal: 10,
            }}
            placeholder="Update email"
            value={editedEmail}
            onChangeText={setEditedEmail}
            keyboardType="email-address"
          />
          <Button title="Update User" onPress={updateUser} />
          <Button title="Cancel" onPress={cancelEdit} color="red" />
        </View>
      )}
            {/* Button to set user for editing */}
            <Button title="Edit User" onPress={() => {
                setEditUser(user);
                setEditedName(user.name);
                setEditedEmail(user.email);
              }} />
              
              {/* Delete button for each user */}
              <Button title="Delete User" onPress={() => deleteUser(user.id)} />
        </View>
      )}

      <Button title="Go Back" onPress={() => router.back()} />
    </ScrollView>
  );
}
