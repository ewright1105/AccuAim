import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Text, View, ScrollView, TextInput, Alert, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardTypeOptions, Modal, KeyboardAvoidingView, Platform,
  TextStyle,
  ViewStyle
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useAuth } from "../AuthContext";
import { Ionicons } from '@expo/vector-icons';

// --- Type Definitions ---
type User = {
  UserID: number;
  email: string;
  name: string;
  timestamp: string;
};

// --- Reusable UI Components (No Changes) ---
type InputFieldProps = {
    icon: keyof typeof Ionicons.glyphMap;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
};
type StyledButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'secondary';
  icon?: keyof typeof Ionicons.glyphMap;
  isLoading?: boolean;
};
type InfoRowProps = {
  label: string;
  value: string;
};
const InputField: React.FC<InputFieldProps> = ({ icon, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default' }) => (
  <View style={styles.inputContainer}>
    <Ionicons name={icon} size={22} color="#B0B0B0" style={styles.inputIcon} /><TextInput style={styles.input} placeholder={placeholder} value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry} keyboardType={keyboardType} placeholderTextColor="#B0B0B0" autoCapitalize="none" />
  </View>
);
const StyledButton: React.FC<StyledButtonProps> = ({ title, onPress, variant = 'primary', icon, isLoading = false }) => {

  const buttonStyles: ViewStyle[] = [styles.buttonBase];
  const textStyles: TextStyle[] = [styles.buttonTextBase];

  // 2. Conditionally push the variant-specific style into the array.
  if (variant === 'primary') {
    buttonStyles.push(styles.buttonPrimary);
    textStyles.push(styles.buttonTextPrimary);
  } else if (variant === 'secondary') {
    buttonStyles.push(styles.buttonSecondary);
    textStyles.push(styles.buttonTextSecondary);
  } else if (variant === 'danger') {
    buttonStyles.push(styles.buttonDanger);
    textStyles.push(styles.buttonTextDanger);
  }
  
  // Determine colors explicitly for icons and indicators
  const indicatorColor = variant === 'primary' ? '#121212' : '#FFFFFF';
  const getIconColor = () => {
    if (variant === 'primary') return '#121212';
    if (variant === 'secondary') return '#F1C40F';
    return '#FFFFFF';
  };
  const iconColor = getIconColor();
  
  return (
    // 3. Pass the entire array to the `style` prop. React Native will merge them correctly.
    <TouchableOpacity onPress={onPress} style={buttonStyles} disabled={isLoading}>
      {isLoading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={20} color={iconColor} style={{ marginRight: 10 }} /> : null}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};
const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => ( <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View> );
const formatDate = (dateString: string | undefined): string => { if (!dateString) { return 'N/A'; } const date = new Date(dateString); if (isNaN(date.getTime())) { return 'N/A'; } return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); };

// --- Main Component ---
export default function UserSettings() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { updateUserName, logout } = useAuth();

  // State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // 'view' now controls which modal is visible. 'main' means no modal.
  const [view, setView] = useState<'main' | 'editProfile' | 'changePassword' | 'deleteAccount'>('main');

  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Hooks and Handlers (No Changes, they work with the new state logic) ---
  useLayoutEffect(() => { navigation.setOptions({ title: "Account Settings", headerStyle: { backgroundColor: '#121212' }, headerTitleStyle: { color: '#FFFFFF' }, headerShadowVisible: false, headerLeft: () => (<TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}><Ionicons name="arrow-back" size={28} color="#F1C40F" /></TouchableOpacity>), }); }, [navigation]);
  useEffect(() => { if (userId) { fetchUserDetails(userId); } else { setError("User ID not provided."); setIsLoading(false); } }, [userId]);
  const fetchUserDetails = async (id: string) => { try { const response = await fetch(`http://127.0.0.1:4949/user/${id}`); if (!response.ok) throw new Error('User not found.'); const dataArray = await response.json(); if (Array.isArray(dataArray) && dataArray.length >= 4) { const [UserID, email, name, timestamp] = dataArray; const userData: User = { UserID, email, name, timestamp }; setUser(userData); setEditedName(userData.name); setEditedEmail(userData.email); } else { throw new Error('Invalid user data format from API.'); } } catch (err: any) { setError(err.message || "Failed to load user details."); } finally { setIsLoading(false); } };
  const handleUpdateProfile = async () => { if (!editedName || !editedEmail) { Alert.alert("Missing Info", "Name and email cannot be empty."); return; } setIsUpdatingProfile(true); try { const response = await fetch(`http://127.0.0.1:4949/user/${userId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editedName.trim(), email: editedEmail.trim() }), }); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Update failed'); await fetchUserDetails(userId!); updateUserName(editedName.trim()); setView('main'); Alert.alert("Success", "Profile updated successfully."); } catch (error: any) { Alert.alert("Error", error.message); } finally { setIsUpdatingProfile(false); } };
  const handlePasswordChange = async () => { if (!currentPassword || !newPassword || !confirmNewPassword) { Alert.alert("Missing Info", "All password fields are required."); return; } if (newPassword !== confirmNewPassword) { Alert.alert("Mismatch", "New passwords do not match."); return; } if (newPassword.length < 8) { Alert.alert("Weak Password", "Password must be at least 8 characters."); return; } setIsUpdatingPassword(true); try { const response = await fetch(`http://127.0.0.1:4949/user/${userId}/change-password`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }), }); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Password change failed.'); Alert.alert("Success", "Password changed successfully."); setView('main'); setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword(""); } catch (error: any) { Alert.alert("Error", error.message); } finally { setIsUpdatingPassword(false); } };
  const performDelete = async () => { if (!deletePassword) { Alert.alert("Confirmation Required", "Please enter your password to confirm deletion."); return; } setIsDeleting(true); try { const response = await fetch(`http://127.0.0.1:4949/user/${userId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: deletePassword }), }); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Could not delete account.'); Alert.alert("Account Deleted", "Your account has been successfully deleted."); logout(); } catch (error: any) { Alert.alert("Error", error.message); } finally { setIsDeleting(false); } };

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#F1C40F" /></View>;
  }
  if (error) {
    return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text><StyledButton title="Go Back" onPress={() => router.back()} /></View>;
  }

  // --- Render Logic ---
  return (
    <View style={styles.container}>
      {/* The main content is always visible */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {user && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Profile Information</Text>
              <InfoRow label="Name" value={user.name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Member Since" value={formatDate(user.timestamp)} />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Account Actions</Text>
              <StyledButton title="Edit Profile" icon="pencil-outline" variant="secondary" onPress={() => setView('editProfile')} />
              <StyledButton title="Change Password" icon="lock-closed-outline" variant="secondary" onPress={() => setView('changePassword')} />
              <StyledButton title="Delete Account" icon="trash-bin-outline" variant="secondary" onPress={() => setView('deleteAccount')} />
            </View>
            <StyledButton title="Sign Out" icon="log-out-outline" variant="danger" onPress={logout} />
          </>
        )}
      </ScrollView>

      {/* --- MODAL FOR OVERLAYS --- */}
           {/* --- MODAL FOR OVERLAYS --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={view !== 'main'}
        onRequestClose={() => setView('main')}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          {/* This TouchableOpacity acts as a background press to close the modal */}
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} // Prevents feedback on background press
            onPress={() => setView('main')} 
          />
            
            {/* 
              FIX: Each conditional block is now wrapped in a ternary operator.
              This prevents the `&&` operator from returning `false` and causing the text error.
            */}

            {/* Edit Profile Modal Content */}
            {view === 'editProfile' ? (
              <View style={styles.modalContent}>
                  <Text style={styles.cardHeader}>Edit Profile</Text>
                  <InputField icon="person-outline" placeholder="Full Name" value={editedName} onChangeText={setEditedName} />
                  <InputField icon="mail-outline" placeholder="Email Address" value={editedEmail} onChangeText={setEditedEmail} keyboardType="email-address" />
                  <StyledButton title="Save Changes" icon="save-outline" isLoading={isUpdatingProfile} onPress={handleUpdateProfile} />
                  <StyledButton title="Cancel" variant="secondary" onPress={() => setView('main')} />
              </View>
            ) : null}

            {/* Change Password Modal Content */}
            {view === 'changePassword' ? (
              <View style={styles.modalContent}>
                  <Text style={styles.cardHeader}>Change Password</Text>
                  <InputField icon="shield-outline" placeholder="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
                  <InputField icon="lock-closed-outline" placeholder="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
                  <InputField icon="lock-closed-outline" placeholder="Confirm New Password" value={confirmNewPassword} onChangeText={setConfirmNewPassword} secureTextEntry />
                  <StyledButton title="Update Password" icon="checkmark-circle-outline" isLoading={isUpdatingPassword} onPress={handlePasswordChange} />
                  <StyledButton title="Cancel" variant="secondary" onPress={() => setView('main')} />
              </View>
            ) : null}

            {/* Delete Account Modal Content */}
            {view === 'deleteAccount' ? (
              <View style={[styles.modalContent, {borderColor: '#E74C3C'}]}>
                  <Text style={[styles.cardHeader, {color: '#E74C3C'}]}>Delete Account</Text>
                  <Text style={styles.warningText}>This action is permanent. To confirm, please enter your password.</Text>
                  <InputField icon="shield-checkmark-outline" placeholder="Enter Password to Confirm" value={deletePassword} onChangeText={setDeletePassword} secureTextEntry />
                  <StyledButton title="Confirm & Delete" icon="trash-outline" variant="danger" isLoading={isDeleting} onPress={performDelete} />
                  <StyledButton title="Cancel" variant="secondary" onPress={() => setView('main')} />
              </View>
            ) : null}
            
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
    // --- New Modal Styles ---
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    },
    modalContent: {
      width: '90%',
      backgroundColor: '#1E1E1E',
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: '#444'
    },
    // --- Existing Styles ---
    container: { flex: 1, backgroundColor: '#121212' },
    contentContainer: { padding: 20, paddingBottom: 50 },
    centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#121212', padding: 20 },
    errorText: { color: '#E74C3C', fontSize: 18, textAlign: 'center', marginBottom: 20 },
    card: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#333333' },
    cardHeader: { fontSize: 22, fontWeight: "bold", color: '#FFFFFF', marginBottom: 20 },
    warningText: { fontSize: 14, color: '#B0B0B0', marginBottom: 15, lineHeight: 20 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121212', borderRadius: 10, width: '100%', height: 55, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#444' },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: '100%', color: '#FFFFFF', fontSize: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
    infoLabel: { fontSize: 16, color: '#B0B0B0' },
    infoValue: { fontSize: 16, color: '#FFFFFF', fontWeight: '500' },
    buttonBase: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 12, width: '100%', marginVertical: 6 },
    buttonTextBase: { fontSize: 16, fontWeight: 'bold' },
    buttonPrimary: { backgroundColor: '#F1C40F' },
    buttonTextPrimary: { color: '#121212' },
    buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#F1C40F' },
    buttonTextSecondary: { color: '#F1C40F' },
    buttonDanger: { backgroundColor: '#E74C3C' },
    buttonTextDanger: { color: '#FFFFFF' },
});