import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface App {
  id: string;
  name: string;
  icon: string;
  packageName: string;
}

const AVAILABLE_APPS: App[] = [
  { id: 'instagram', name: 'Instagram', icon: '📷', packageName: 'com.instagram.android' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', packageName: 'com.zhiliaoapp.musically' },
  { id: 'twitter', name: 'Twitter', icon: '🐦', packageName: 'com.twitter.android' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', packageName: 'com.google.android.youtube' },
  { id: 'facebook', name: 'Facebook', icon: '👥', packageName: 'com.facebook.katana' },
  { id: 'snapchat', name: 'Snapchat', icon: '👻', packageName: 'com.snapchat.android' },
  { id: 'reddit', name: 'Reddit', icon: '🤖', packageName: 'com.reddit.frontpage' },
  { id: 'netflix', name: 'Netflix', icon: '🎬', packageName: 'com.netflix.mediaclient' },
];

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [setupStep, setSetupStep] = useState<'lock' | 'unlock' | 'goal' | 'workout' | 'success'>('lock');
  const [selectedToLock, setSelectedToLock] = useState<string[]>([]);
  const [selectedToUnlock, setSelectedToUnlock] = useState<string[]>([]);
  const [pushupGoal, setPushupGoal] = useState(20);
  const [currentCount, setCurrentCount] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Load streak data
      const savedStreak = await AsyncStorage.getItem('streak');
      if (savedStreak) setStreak(parseInt(savedStreak));
    })();
  }, []);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: currentCount / pushupGoal,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Pulse animation on rep complete
    if (currentCount > 0 && currentCount < pushupGoal) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Check if goal reached
    if (currentCount >= pushupGoal && setupStep === 'workout') {
      handleWorkoutComplete();
    }
  }, [currentCount]);

  const handleWorkoutComplete = async () => {
    setSetupStep('success');
    setIsCameraActive(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Update streak
    const newStreak = streak + 1;
    setStreak(newStreak);
    await AsyncStorage.setItem('streak', newStreak.toString());
    
    // Save workout to history
    const today = new Date().toISOString().split('T')[0];
    const workoutData = {
      date: today,
      reps: pushupGoal,
      appsUnlocked: selectedToUnlock,
    };
    const history = await AsyncStorage.getItem('workoutHistory');
    const historyArray = history ? JSON.parse(history) : [];
    historyArray.push(workoutData);
    await AsyncStorage.setItem('workoutHistory', JSON.stringify(historyArray));
  };

  const toggleAppToLock = (appId: string) => {
    setSelectedToLock(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const toggleAppToUnlock = (appId: string) => {
    setSelectedToUnlock(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const startWorkout = () => {
    if (!hasPermission) {
      Alert.alert('Camera Permission', 'Please grant camera permission to start workout');
      return;
    }
    setSetupStep('workout');
    setIsCameraActive(true);
    setCurrentCount(0);
  };

  const simulatePushup = () => {
    // In real app, this would be called by CV detection
    if (currentCount < pushupGoal) {
      setCurrentCount(prev => prev + 1);
      setFeedback('Great rep! Keep going! 💪');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const resetWorkout = () => {
    setSetupStep('lock');
    setSelectedToLock([]);
    setSelectedToUnlock([]);
    setCurrentCount(0);
    setIsCameraActive(false);
    setFeedback('');
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text style={styles.text}>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.container}><Text style={styles.text}>No access to camera</Text></View>;
  }

  return (
    <LinearGradient colors={['#6366f1', '#8b5cf6', '#d946ef']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💪 FitLock</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak} day streak</Text>
          </View>
        </View>

        {/* Setup: Select Apps to Lock */}
        {setupStep === 'lock' && (
          <View style={styles.card}>
            <Text style={styles.stepTitle}>Step 1: Apps to Lock 🔒</Text>
            <Text style={styles.stepSubtitle}>Choose apps to restrict</Text>
            
            <View style={styles.appsGrid}>
              {AVAILABLE_APPS.map(app => (
                <TouchableOpacity
                  key={app.id}
                  style={[
                    styles.appButton,
                    selectedToLock.includes(app.id) && styles.appButtonSelected
                  ]}
                  onPress={() => toggleAppToLock(app.id)}
                >
                  <Text style={styles.appIcon}>{app.icon}</Text>
                  <Text style={styles.appName}>{app.name}</Text>
                  {selectedToLock.includes(app.id) && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={20} color="#ef4444" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, selectedToLock.length === 0 && styles.buttonDisabled]}
              onPress={() => setSetupStep('unlock')}
              disabled={selectedToLock.length === 0}
            >
              <Text style={styles.buttonText}>Next: Choose Rewards ({selectedToLock.length})</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Setup: Select Apps to Unlock */}
        {setupStep === 'unlock' && (
          <View style={styles.card}>
            <Text style={styles.stepTitle}>Step 2: Your Rewards 🎁</Text>
            <Text style={styles.stepSubtitle}>Unlock after workout</Text>
            
            <View style={styles.appsGrid}>
              {AVAILABLE_APPS.map(app => (
                <TouchableOpacity
                  key={app.id}
                  style={[
                    styles.appButton,
                    selectedToUnlock.includes(app.id) && styles.appButtonUnlocked
                  ]}
                  onPress={() => toggleAppToUnlock(app.id)}
                >
                  <Text style={styles.appIcon}>{app.icon}</Text>
                  <Text style={styles.appName}>{app.name}</Text>
                  {selectedToUnlock.includes(app.id) && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, { flex: 1, marginRight: 8 }]}
                onPress={() => setSetupStep('lock')}
              >
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSuccess, { flex: 1 }, selectedToUnlock.length === 0 && styles.buttonDisabled]}
                onPress={() => setSetupStep('goal')}
                disabled={selectedToUnlock.length === 0}
              >
                <Text style={styles.buttonText}>Next ({selectedToUnlock.length})</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Setup: Set Goal */}
        {setupStep === 'goal' && (
          <View style={styles.card}>
            <Text style={styles.stepTitle}>Step 3: Set Your Goal 🎯</Text>
            <Text style={styles.stepSubtitle}>How many pushups?</Text>
            
            <View style={styles.goalContainer}>
              <Animated.Text style={[styles.goalNumber, { transform: [{ scale: pulseAnim }] }]}>
                {pushupGoal}
              </Animated.Text>
              <Text style={styles.goalLabel}>pushups</Text>
            </View>

            <View style={styles.sliderContainer}>
              <TouchableOpacity onPress={() => setPushupGoal(Math.max(10, pushupGoal - 5))}>
                <Ionicons name="remove-circle" size={32} color="#fff" />
              </TouchableOpacity>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${(pushupGoal - 10) / 0.9}%` }]} />
              </View>
              <TouchableOpacity onPress={() => setPushupGoal(Math.min(100, pushupGoal + 5))}>
                <Ionicons name="add-circle" size={32} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>🔒 Locking: {selectedToLock.length} apps</Text>
              <Text style={styles.summaryText}>🎁 Unlocking: {selectedToUnlock.length} apps</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, { flex: 1, marginRight: 8 }]}
                onPress={() => setSetupStep('unlock')}
              >
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, { flex: 1 }]}
                onPress={startWorkout}
              >
                <Text style={styles.buttonText}>🚀 Start Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Workout Screen */}
        {setupStep === 'workout' && (
          <View style={styles.card}>
            <View style={styles.workoutHeader}>
              <Text style={styles.countDisplay}>
                {currentCount}
                <Text style={styles.countGoal}>/{pushupGoal}</Text>
              </Text>
              <Text style={styles.countLabel}>pushups</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>

            {/* Camera View */}
            <View style={styles.cameraContainer}>
              {isCameraActive ? (
                <CameraView style={styles.camera} facing="front">
                  <View style={styles.cameraOverlay}>
                    <View style={styles.liveBadge}>
                      <View style={styles.liveIndicator} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  </View>
                </CameraView>
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <Ionicons name="camera-outline" size={64} color="#fff" />
                  <Text style={styles.cameraPlaceholderText}>Camera Loading...</Text>
                </View>
              )}
            </View>

            {feedback ? (
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackText}>{feedback}</Text>
              </View>
            ) : null}

            {/* Simulate Button (for testing - remove in production) */}
            <TouchableOpacity
              style={[styles.button, styles.buttonWarning]}
              onPress={simulatePushup}
            >
              <Text style={styles.buttonText}>⚡ Do Pushup (Test)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={resetWorkout}
            >
              <Text style={styles.buttonText}>Stop & Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Success Screen */}
        {setupStep === 'success' && (
          <View style={styles.card}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Workout Complete!</Text>
            <Text style={styles.successSubtitle}>You did {pushupGoal} pushups!</Text>

            <View style={styles.unlockedApps}>
              <Text style={styles.unlockedTitle}>🔓 Apps Unlocked:</Text>
              {selectedToUnlock.map(id => {
                const app = AVAILABLE_APPS.find(a => a.id === id);
                return app ? (
                  <View key={id} style={styles.unlockedApp}>
                    <Text style={styles.appIcon}>{app.icon}</Text>
                    <Text style={styles.unlockedAppName}>{app.name}</Text>
                    <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                  </View>
                ) : null;
              })}
            </View>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={resetWorkout}
            >
              <Text style={styles.buttonText}>New Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  streakText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 20,
    backdropFilter: 'blur(10px)',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  appButton: {
    width: (width - 80) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  appButtonSelected: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: '#ef4444',
  },
  appButtonUnlocked: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderColor: '#22c55e',
  },
  appIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  appName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPrimary: {
    backgroundColor: '#ec4899',
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonSuccess: {
    backgroundColor: '#22c55e',
  },
  buttonWarning: {
    backgroundColor: '#f59e0b',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  goalContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  goalNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
  },
  goalLabel: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  summaryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  workoutHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countDisplay: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
  },
  countGoal: {
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  countLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  cameraContainer: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-end',
    gap: 6,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholderText: {
    color: '#fff',
    marginTop: 12,
  },
  feedbackBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  feedbackText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  successEmoji: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  unlockedApps: {
    marginBottom: 20,
  },
  unlockedTitle: {
    fontSize: 18,
    fontWeight: 'bo
