// screens/OutputScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated 
} from 'react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';

interface OutputScreenProps {
  onNavigate: (screen: string) => void;
}

export default function OutputScreen({ onNavigate }: OutputScreenProps) {
  const [outputText, setOutputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => onNavigate('signin')}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.outputContainer, { opacity: fadeAnim }]}>
        <Text style={styles.outputTitle}>Microcontroller Output:</Text>
        <Text style={styles.outputText}>{outputText}</Text>
      </Animated.View>
      
      <TouchableOpacity 
        style={[styles.speakerButton, isSpeaking && styles.speakerButton]}
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
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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
  gradient: {
    padding: 20,
    alignItems: 'center',
  },
  speakerButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});