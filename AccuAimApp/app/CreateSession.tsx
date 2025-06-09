import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For the icon
import { useNavigation, useRouter } from 'expo-router';
import { useAuth } from './AuthContext';
import { parseQueryParams } from 'expo-router/build/fork/getStateFromPath-forks';
import { setParams } from 'expo-router/build/global-state/routing';

const CreateSessionScreen: React.FC = () => {
    const { user } = useAuth();
    const [numBlocks, setNumBlocks] = useState<number>(0);
    const [blocks, setBlocks] = useState<Array<any>>([{ targetArea: 'Top Right', shotsPlanned: '0' }]);
    const [targetAreas] = useState(['Top Right', 'Top Left', 'Bottom Right', 'Bottom Left', 'Top Shelf', 'Right Pipe', 'Left Pipe', 'Five Hole']);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);

    const navigation = useNavigation();
    const router = useRouter();
    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Sessions",
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                    <Text style={{ color: "#F1C40F", fontSize: 26 }}>←</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleNumBlocksChange = (text: string) => {
        const newNumBlocks = Number(text);
        setNumBlocks(newNumBlocks);
        
        const currentBlocks = [...blocks];
        if (newNumBlocks > currentBlocks.length) {
            for (let i = currentBlocks.length; i < newNumBlocks; i++) {
                currentBlocks.push({ targetArea: 'Top Right', shotsPlanned: '' });
            }
        } else {
            currentBlocks.splice(newNumBlocks);
        }
        setBlocks(currentBlocks);
    };

    const handleBlockChange = (index: number, field: string, value: string) => {
        const updatedBlocks = blocks.map((block, i) => {
            if (i === index) {
                return { ...block, [field]: value };
            }
            return block;
        });
        setBlocks(updatedBlocks);
    };

    const handleCreateSession = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:4949/user/${user?.UserID}/sessions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ UserID: user?.UserID, blocks: blocks }),
            });

            if (!response.ok) {
                throw new Error('Failed to create session');
            }

            const result = await response.json();
            console.log('Session Created:', result);

            try {
                const sessionResponse = await fetch(`http://127.0.0.1:4949/user/${user?.UserID}/sessions`);
                const sessions = await sessionResponse.json();
            
              
                    const SessionID = sessions[sessions.length-1][0];  // Accessing the last session
                 
                    router.push({
                        pathname: "/ActiveSession",
                        params: { SessionID }
                    });
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error('Error creating session:', error);
        }
    };

    const renderBlockInputs = () => {
        const blockInputs = [];
        for (let i = 0; i < numBlocks; i++) {
            blockInputs.push(
                <View key={i} style={styles.blockContainer}>
                    <Text style={styles.blockTitle}>Block {i + 1}</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Target Area</Text>
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => {
                                setSelectedBlockIndex(i);
                                setModalVisible(true);
                            }}
                        >
                            <Text style={styles.inputText}>{blocks[i]?.targetArea}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Shots Planned</Text>
                        <TextInput
                            style={styles.input}
                            value={blocks[i]?.shotsPlanned}
                            onChangeText={(text) => handleBlockChange(i, 'shotsPlanned', text)}
                            keyboardType="numeric"
                            placeholder="Enter shots planned"
                            placeholderTextColor="#aaa"
                        />
                    </View>
                </View>
            );
        }
        return blockInputs;
    };

    const handleTargetAreaSelect = (area: string) => {
        if (selectedBlockIndex !== null) {
            handleBlockChange(selectedBlockIndex, 'targetArea', area);
            setModalVisible(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Create a New Session</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Number of Blocks</Text>
                <TextInput
                    style={styles.input}
                    value={String(numBlocks)}
                    onChangeText={(text) => handleNumBlocksChange(text)}
                    keyboardType="numeric"
                    placeholder="Enter number of blocks"
                    placeholderTextColor="#aaa"
                />
            </View>

            {renderBlockInputs()}

            <TouchableOpacity style={styles.createButton} onPress={handleCreateSession}>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.createButtonText}>Start Session</Text>
            </TouchableOpacity>

            {/* Modal for target area selection */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <FlatList
                            data={targetAreas}
                            keyExtractor={(item, index) => index.toString()}
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
                </View>
            </Modal>
        </ScrollView>
    );
};

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
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 5,
        color: "#F1C40F",
    },
    input: {
        height: 40,
        borderColor: "#F1C40F",
        borderWidth: 1,
        marginBottom: 10,
        width: "100%",
        paddingHorizontal: 10,
        color: "#F1C40F",
        justifyContent: "center"
    },
    inputText: {
        fontSize: 16,
        color: "#F1C40F",
    },
    blockContainer: {
        marginBottom: 25,
    },
    blockTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#F1C40F",
        marginBottom: 10,
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1C40F",
        paddingVertical: 15,
        borderRadius: 5,
        justifyContent: "center",
        marginTop: 30,
    },
    createButtonText: {
        color: "#fff",
        fontSize: 18,
        marginLeft: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        width: "80%",
        backgroundColor: "#121212",
        padding: 20,
        borderRadius: 10,
    },
    modalItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#F1C40F",
    },
    modalItemText: {
        fontSize: 16,
        color: "#F1C40F",
    },
});

export default CreateSessionScreen;
