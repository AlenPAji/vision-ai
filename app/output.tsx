import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Alert,
  Dimensions
} from 'react-native';
import Svg, { Circle } from "react-native-svg"
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import useBLE from '@/lib/useBLE';
const { width } = Dimensions.get("window")
const AnimatedCircle = Animated.createAnimatedComponent(Circle)
import Icon from "react-native-vector-icons/MaterialIcons"
import DeviceModal from '@/components/DeviceConnectionModal';



export default function OutputScreen() {
  const router = useRouter();
  const { logOut, user } = useAuth();
  const [outputText, setOutputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [connectionStatus, setConnectionStatus] = useState("Disconnected")
  const [isConnected, setIsConnected] = useState(false)
  const progress = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current


  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    location,
    receivedText
} = useBLE();

const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    console.log(isPermissionsEnabled)
    if (isPermissionsEnabled) {
      console.log("scanning...")
        scanForPeripherals();
    }
};

useEffect(() => {
  if (receivedText) {
    setOutputText(receivedText); // Update outputText when receivedText changes
    console.log("New text received:", receivedText);
  }
}, [receivedText]);

  useEffect(() => {
    // Mock microcontroller data
    const mockData = 'Hello, this is a test output from SignSpeak';
    setOutputText(mockData);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (connectedDevice) {
      // Connected animation
      Animated.timing(progress, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start(() => {
        setConnectionStatus('Connected');
      });
    } else {
      // Reset to disconnected state
      Animated.timing(progress, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }).start(() => {
        setConnectionStatus('Disconnected');
      });
    }
  }, [connectedDevice]);
  
  // Pulse animation when not connected
  useEffect(() => {
    if (!connectedDevice) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [connectedDevice, pulseAnim]);
  
  const hideModal = () => {
      setIsModalVisible(false);
  };
  
  const openModal = async () => {
      scanForDevices();
      setIsModalVisible(true);
  };

  const handleSpeak = async () => {
    try {
      if (isSpeaking) {
        await Speech.stop();
        setIsSpeaking(false);
      } else {
        setIsSpeaking(true);
        await Speech.speak(outputText, {
          onDone: () => setIsSpeaking(false),
        });
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsSpeaking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      router.replace('/');
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  const strokeWidth = 10
  const radius = 50
  const circumference = 2 * Math.PI * radius

  return (
    <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.replace('/signin')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.welcomeText}>
        Welcome, {user?.email || 'User'}!
      </Text>

      <Animated.View style={[styles.outputContainer, { opacity: fadeAnim }]}>
  <Text style={styles.outputTitle}>Microcontroller Output:</Text>
  <Text style={styles.outputText}>{outputText}</Text>
</Animated.View>
      <View style={styles.safetyStatusContainer}>
            <Text style={styles.safetyStatusTitle}>Safety Device Status</Text>

            <Animated.View style={[styles.connectionButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
              <TouchableOpacity onPress={connectedDevice ? undefined : openModal} style={styles.connectionButton}>
                <Svg height="180" width="180" viewBox="0 0 120 120">
                  <Circle cx="60" cy="60" r={radius} stroke="#333333" strokeWidth={strokeWidth} fill="none" />
                  <AnimatedCircle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke={connectedDevice ? "#4CAF50" : "#FF5252"}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [circumference, 0],
                    })}
                    strokeLinecap="round"
                  />
                </Svg>
                <View style={styles.connectionStatusContainer}>
                  <Icon
                    name={connectedDevice ? "bluetooth-connected" : "bluetooth-disabled"}
                    size={32}
                    color={connectedDevice ? "#4CAF50" : "#FF5252"}
                  />
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit={false}
                    style={[styles.connectionStatusText, { color: connectedDevice ? "#4CAF50" : "#FF5252" }]}
                  >
                    {connectionStatus}
                  </Text>
                  <Text style={styles.tapToConnectText}>{connectedDevice ? "Protected" : "Tap to connect"}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {connectedDevice && (
              <View style={styles.protectionActiveContainer}>
                <Icon name="shield" size={20} color="#4CAF50" />
                <Text style={styles.protectionActiveText}>Accident detection active</Text>
              </View>
            )}
          </View>

          <DeviceModal
                closeModal={hideModal}
                visible={isModalVisible}
                connectToPeripheral={connectToDevice}
                devices={allDevices}
            />
      
      <TouchableOpacity 
        style={[styles.speakerButton, isSpeaking && styles.speakerButtonActive]}
        onPress={handleSpeak}
      >
        <LinearGradient
          colors={isSpeaking ? ['#E24A4A', '#C43A3A'] : ['#5DA7F3', '#4A90E2']}
          style={styles.gradient}
        >
          <Text style={styles.speakerButtonText}>
            {isSpeaking ? '🔊 Stop Speaking' : '🔈 Speak Output'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  

  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginBottom: 10,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  outputContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  outputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  outputText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#34495E',
  },
  speakerButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 30,
  },
  speakerButtonActive: {
    // Specific styles for when speaking is active
  },
  gradient: {
    padding: 20,
    alignItems: 'center',
  },
  speakerButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 20,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 80, // Added extra padding for tab bar
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  userTextContainer: {
    marginLeft: 12,
  },
  
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  sendAlertButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    flex: 1,
    marginLeft: 8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  safetyStatusContainer: {
    backgroundColor: "#121212",
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#333333",
  },
  safetyStatusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  connectionButtonContainer: {
    marginVertical: 10,
  },
  connectionButton: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  connectionStatusContainer: {
    position: "absolute",
    alignItems: "center",
    width: 120, // Set a fixed width to contain the text
  },
  connectionStatusText: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "center", // Center the text
    includeFontPadding: false, // Removes extra padding
  },
  tapToConnectText: {
    fontSize: 12,
    color: "#AAAAAA",
    marginTop: 4,
  },
  protectionActiveContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  protectionActiveText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: 6,
  },
  emergencyActionsContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "white",
  },
  emergencyButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  emergencyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  quickActionsContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: (width - 50) / 2,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#333333",
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  safetyTipsContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  safetyTipsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  tipsScrollContent: {
    paddingRight: 20,
  },
  tipCard: {
    width: 200,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#333333",
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 10,
    marginBottom: 5,
  },
  tipDescription: {
    fontSize: 12,
    color: "#AAAAAA",
    lineHeight: 18,
  },
});