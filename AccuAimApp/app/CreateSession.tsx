import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { useAuth } from './AuthContext';

const CreateSessionScreen: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();
    const navigation = useNavigation();

    // State initialized for a cleaner start. Start with 1 block by default.
    const [blocks, setBlocks] = useState<Array<any>>([{ targetArea: 'Top Right', shotsPlanned: '' }]);
    
    // Corrected target areas to match the database ENUM
    const [targetAreas] = useState([
        'Top Right', 'Top Left', 'Bottom Right', 'Bottom Left', 'Left Hip', 'Right Hip', 'Bar Down'
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "New Session",
            headerStyle: { backgroundColor: '#121212' },
            headerTitleStyle: { color: '#FFFFFF' },
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                    <Ionicons name="arrow-back" size={28} color="#F1C40F" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleBlockChange = (index: number, field: string, value: string) => {
        const updatedBlocks = blocks.map((block, i) => {
            if (i === index) {
                // For shotsPlanned, only allow numbers
                if (field === 'shotsPlanned') {
                    return { ...block, [field]: value.replace(/[^0-9]/g, '') };
                }
                return { ...block, [field]: value };
            }
            return block;
        });
        setBlocks(updatedBlocks);
    };
    
    const addBlock = () => {
        setBlocks([...blocks, { targetArea: 'Top Right', shotsPlanned: '' }]);
    };

    const removeBlock = (index: number) => {
        if (blocks.length > 1) { // Prevent removing the last block
            const updatedBlocks = blocks.filter((_, i) => i !== index);
            setBlocks(updatedBlocks);
        }
    };


    const handleCreateSession = async () => {
        // Validate that all blocks have shots planned
        if (blocks.some(block => !block.shotsPlanned || parseInt(block.shotsPlanned, 10) === 0)) {
            alert("Please enter a valid number of shots for all blocks.");
            return;
        }

        try {
            const response = await fetch(`http://172.20.10.6:4949/user/${user?.UserID}/sessions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blocks: blocks }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create session');
            }

            const newSession = await response.json();
            const sessionID = newSession[0];

            router.replace({
                pathname: "/ActiveSession",
                params: { SessionID: sessionID }
            });

        } catch (error) {
            console.error('Error creating session:', error);
            alert(`Error: ${error}`);
        }
    };

    const renderBlockInputs = () => {
        return blocks.map((block, i) => (
            <View key={i} style={styles.blockContainer}>
                <View style={styles.blockHeader}>
                    <Text style={styles.blockTitle}>Block {i + 1}</Text>
                    {blocks.length > 1 && (
                         <TouchableOpacity onPress={() => removeBlock(i)}>
                            <Ionicons name="trash-bin-outline" size={22} color="#E74C3C" />
                        </TouchableOpacity>
                    )}
                </View>
                
                {/* Target Area Input */}
                <Text style={styles.label}>Target Area</Text>
                <TouchableOpacity
                    style={styles.pickerInput}
                    onPress={() => {
                        setSelectedBlockIndex(i);
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.inputText}>{block.targetArea}</Text>
                    <Ionicons name="chevron-down" size={20} color="#F1C40F" />
                </TouchableOpacity>

                {/* Shots Planned Input */}
                <Text style={styles.label}>Shots Planned</Text>
                <TextInput
                    style={styles.input}
                    value={block.shotsPlanned}
                    onChangeText={(text) => handleBlockChange(i, 'shotsPlanned', text)}
                    keyboardType="number-pad"
                    placeholder="e.g., 25"
                    placeholderTextColor="#888"
                />
            </View>
        ));
    };

    const handleTargetAreaSelect = (area: string) => {
        if (selectedBlockIndex !== null) {
            handleBlockChange(selectedBlockIndex, 'targetArea', area);
            setModalVisible(false);
            setSelectedBlockIndex(null);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={90}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.headerContainer}>
                    <Text style={styles.header}>Plan Your Practice</Text>
                    <Text style={styles.subHeader}>Define your targets and shot counts for this session.</Text>
                </View>

                {renderBlockInputs()}

                <TouchableOpacity style={styles.addBlockButton} onPress={addBlock}>
                    <Ionicons name="add" size={22} color="#F1C40F" />
                    <Text style={styles.addBlockButtonText}>Add Another Block</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.createButton} onPress={handleCreateSession}>
                    <Ionicons name="rocket-outline" size={28} color="#121212" />
                    <Text style={styles.createButtonText}>Start Session</Text>
                </TouchableOpacity>

                {/* Modal for target area selection */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setModalVisible(false)}>
                        <View style={styles.modalContainer}>
                            <FlatList
                                data={targetAreas}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => handleTargetAreaSelect(item)}
                                    >
                                        <Text style={styles.modalItemText}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        paddingHorizontal: 20,
    },
    headerContainer: {
        paddingTop: 20,
        paddingBottom: 20,
    },
    header: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    subHeader: {
        fontSize: 18,
        color: '#B0B0B0',
        marginTop: 4,
    },
    blockContainer: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
    },
    blockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    blockTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    label: {
        fontSize: 16,
        color: "#B0B0B0",
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#2C2C2C',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: "#FFFFFF",
        marginBottom: 15,
    },
    pickerInput: {
        backgroundColor: '#2C2C2C',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 15,
        color: "#FFFFFF",
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center',
        marginBottom: 15,
    },
    inputText: {
        fontSize: 16,
        color: "#FFFFFF",
    },
    addBlockButton: {
        backgroundColor: '#1E1E1E',
        borderColor: '#333333',
        borderWidth: 1.5,
        borderRadius: 12,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    addBlockButtonText: {
        color: '#F1C40F',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    createButton: {
        backgroundColor: "#F1C40F",
        borderRadius: 12,
        paddingVertical: 18,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
    },
    createButtonText: {
        color: "#121212",
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContainer: {
        width: "85%",
        backgroundColor: "#1E1E1E",
        borderRadius: 16,
        padding: 10,
        maxHeight: '60%',
    },
    modalItem: {
        paddingVertical: 18,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#333333",
    },
    modalItemText: {
        fontSize: 18,
        color: "#FFFFFF",
        textAlign: 'center'
    },
});

export default CreateSessionScreen;