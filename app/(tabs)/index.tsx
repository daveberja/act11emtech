import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'; // Import NetInfo and types

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isConnected, setIsConnected] = useState<boolean | null>(true); // Connection status

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const reachable = state.isInternetReachable ?? false; // Default to false if null
      setIsConnected(state.isConnected && reachable);
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

  const sendMessage = () => {
    if (messageText.trim() !== '') {
      setMessages((prevMessages) => [
        { id: Date.now().toString(), text: messageText, isUser: true },
        ...prevMessages,
      ]);
      setMessageText('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* StatusBar Component */}
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      {/* Connection Status */}
      <View style={styles.connectionStatus}>
        <Text
          style={{
            color: isConnected === false ? 'red' : isConnected === true ? 'green' : 'orange',
            fontWeight: 'bold',
          }}
        >
          {isConnected === false
            ? 'No Network Connection'
            : isConnected === true
            ? 'Connected'
            : 'Unknown Network Status'}
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
              style={[
                styles.messageBubble,
                item.isUser ? styles.userMessage : styles.otherMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
        />
      </View>

      {/* Toolbar Component */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.toolbar}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.cameraButton}>
            <Image
              source={require('../../assets/images/camera.jpg')} // Corrected path for the camera image
              style={styles.cameraIcon}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder={isConnected ? 'Type a message...' : 'No Network Connection'}
            placeholderTextColor="#888"
            value={messageText}
            onChangeText={setMessageText}
            editable={isConnected} // Disable input when disconnected
          />
          <TouchableOpacity
            style={[styles.sendButton, !isConnected && { backgroundColor: 'gray' }]}
            onPress={sendMessage}
            disabled={!isConnected} // Disable send button when disconnected
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* InputMethodEditor Component */}
      <View style={styles.inputMethodEditor}>
        <Image
          source={require('../../assets/images/pikachu.jpg')} // Corrected path for Pikachu image
          style={styles.image}
        />
        <Image
          source={require('../../assets/images/pikachu.jpg')} // Corrected path for Pikachu image
          style={styles.image}
        />
        <Image
          source={require('../../assets/images/pikachu.jpg')} // Corrected path for Pikachu image
          style={styles.image}
        />
      </View>

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
    backgroundColor: 'white',
  },
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  messageBubble: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '75%',
  },
  userMessage: {
    backgroundColor: '#0078fe',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: 'black',
    fontSize: 16,
  },
  toolbar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#0078fe',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cameraButton: {
    marginRight: 10,
  },
  cameraIcon: {
    width: 30,
    height: 30,
  },
  inputMethodEditor: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  tab: {
    color: '#0078fe',
    fontSize: 16,
  },
});
