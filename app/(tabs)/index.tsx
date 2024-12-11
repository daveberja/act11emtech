import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker
import * as Location from "expo-location"; // Import Location for geolocation
import NetInfo from "@react-native-community/netinfo";


type Message = {
  id: string;
  text: string;
  isUser: boolean;
  image?: string; // For image support in messages
  latitude?: number; // For storing location coordinates
  longitude?: number;
};

const MANILA_LAT = 14.5995;
const MANILA_LNG = 120.9842;

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isConnected, setIsConnected] = useState<boolean | null>(true); // Connection status
  const [modalVisible, setModalVisible] = useState<boolean>(false); // For controlling the image modal visibility
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // To store the selected image URL
  const [locationPermission, setLocationPermission] = useState<boolean>(false); // Track if permission is granted

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const reachable = state.isInternetReachable ?? false; // Default to false if null
      setIsConnected(state.isConnected && reachable);
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

  // Function to request location permission
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "You need to allow location access");
      setLocationPermission(false);
    } else {
      setLocationPermission(true);
    }
  };

  const sendMessage = () => {
    if (messageText.trim() !== "") {
      setMessages((prevMessages) => [
        { id: Date.now().toString(), text: messageText, isUser: true },
        ...prevMessages,
      ]);
      setMessageText("");
    }
  };

  // Camera button handler
  const handleCameraPress = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "You need to allow camera access to use this feature."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    if (!result.canceled) {
      setMessages((prevMessages) => [
        {
          id: Date.now().toString(),
          text: "Captured an image!",
          isUser: true,
          image: result.assets[0].uri,
        },
        ...prevMessages,
      ]);
    }
  };

  // Function to send the location as a message with a clickable pin
  const handleLocationPress = async () => {
    if (!locationPermission) {
      Alert.alert("Permission Required", "You need to enable location permission first.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const locationMessage = `📍 Philippines, Manila: Click to view in Google Maps`;

    setMessages((prevMessages) => [
      { id: Date.now().toString(), text: locationMessage, isUser: true, latitude, longitude },
      ...prevMessages,
    ]);
  };

  // Open full-screen image modal
  const openImageModal = (imageUri: string) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
    Keyboard.dismiss(); // Close the keyboard manually
  };

  // Close the modal
  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* StatusBar Component */}
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      {/* Connection Status */}
      <View style={styles.connectionStatus}>
        <Text
          style={{
            color: isConnected === false ? "red" : isConnected === true ? "green" : "orange",
            fontWeight: "bold",
          }}
        >
          {isConnected === false
            ? "No Network Connection"
            : isConnected === true
            ? "Connected"
            : "Unknown Network Status"}
        </Text>
      </View>

      {/* MessageList Component */}
      <View style={styles.content}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          inverted
          renderItem={({ item }) => (
            <View
              style={[styles.messageBubble, item.isUser ? styles.userMessage : styles.otherMessage]}
            >
              {item.text.includes("📍") ? (
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(`https://www.google.com/maps?q=${item.latitude},${item.longitude}`)
                  }
                >
                 <Image
                      source={require("../../assets/images/manila.png")}  // Use the correct path to the image
                      style={{ width: 200, height: 250 }}  // Adjust size if needed
                  />
                </TouchableOpacity>
              ) : item.image ? (
                <TouchableOpacity onPress={() => openImageModal(item.image)}>
                  <Image source={{ uri: item.image }} style={styles.messageImage} />
                </TouchableOpacity>
              ) : (
                <Text style={styles.messageText}>{item.text}</Text>
              )}
            </View>
          )}
        />
      </View>

      {/* Toolbar Component */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.toolbar}>
        <View style={styles.inputRow}>
          {/* Camera button */}
          <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
            <Image source={require("../../assets/images/camera.jpg")} style={styles.buttonIcon} />
          </TouchableOpacity>

          {/* Location button */}
          <TouchableOpacity
            style={styles.locationButton}
            onPress={async () => {
              // Request location permission before accessing the location
              await requestLocationPermission();
              if (locationPermission) {
                handleLocationPress();
              }
            }}
          >
            <Image source={require("../../assets/images/download.png")} style={styles.buttonIcon} />
          </TouchableOpacity>

          {/* Message Input */}
          <TextInput
            style={styles.input}
            placeholder={isConnected ? "Type a message..." : "No Network Connection"}
            placeholderTextColor="#888"
            value={messageText}
            onChangeText={setMessageText}
            editable={isConnected} // Disable input when disconnected
          />

          {/* Send button */}
          <TouchableOpacity
            style={[styles.sendButton, !isConnected && { backgroundColor: "gray" }]}
            onPress={sendMessage}
            disabled={!isConnected} // Disable send button when disconnected
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Image Modal for fullscreen image */}
      {selectedImage && (
        <Modal visible={modalVisible} animationType="fade" transparent={true} onRequestClose={closeImageModal}>
          <TouchableWithoutFeedback onPress={closeImageModal}>
            <View style={styles.modalBackdrop}>
              <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} />
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Tabs Component */}
      <View style={styles.tabs}>
        <Text style={styles.tab}>Home</Text>
        <Text style={styles.tab}>Profile</Text>
        <Text style={styles.tab}>Settings</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  connectionStatus: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    backgroundColor: "white",
  },
  messageBubble: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  userMessage: {
    backgroundColor: "#0078fe",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "black",
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  toolbar: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.04)",
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    backgroundColor: "#0078fe",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
  },
  cameraButton: {
    marginRight: 10,
  },
  locationButton: {
    marginRight: 10,
  },
  buttonIcon: {
    width: 30,
    height: 30,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  fullscreenImage: {
    width: "90%",
    height: "80%",
    resizeMode: "contain",
    borderRadius: 10,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingVertical: 10,
    backgroundColor: "white",
  },
  tab: {
    color: "#0078fe",
    fontSize: 16,
  },
});
