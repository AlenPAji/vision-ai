import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push('/signin');
  };

  return (
    <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.container}>
      <Animated.View style={[styles.content, {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }]}>
        <Text style={styles.title}>SignSpeak</Text>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>👋</Text>
          <Text style={styles.icon}>🗣️</Text>
        </View>
        <Text style={styles.subtitle}>Converting Signs to Speech</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleGetStarted}
        >
          <LinearGradient colors={['#5DA7F3', '#4A90E2']} style={styles.gradient}>
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  iconContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
    marginHorizontal: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 40,
  },
  button: {
    width: 200,
    borderRadius: 15,
    overflow: 'hidden',
  },
  gradient: {
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});