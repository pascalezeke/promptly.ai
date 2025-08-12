import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { useTheme } from '@/hooks/useTheme';
import { VoiceVisualizer } from '@/components/VoiceVisualizer';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

const { width } = Dimensions.get('window');

export default function VoiceScreen() {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');
  
  const { startRecording, stopRecording, isAvailable } = useVoiceRecognition();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    if (isRecording) {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 1000 }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withTiming(0.7, { duration: 1000 }),
        -1,
        true
      );
    } else {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1);
      opacity.value = withTiming(1);
    }
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      setTranscription('');
      const result = await startRecording();
      setTranscription(result || '');
    } catch (error) {
      console.error('Recording failed:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      const result = await stopRecording();
      if (result) {
        setTranscription(result);
        // Send to AI and get response
        await handleAIResponse(result);
      }
    } catch (error) {
      console.error('Stop recording failed:', error);
    }
  };

  const handleAIResponse = async (text: string) => {
    // Simulate AI processing
    setResponse('Processing your request...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setResponse(`Here's my response to: "${text}". This is a simulated AI response that would normally come from Hey Blue AI.`);
  };

  const speakResponse = async () => {
    if (isSpeaking) {
      await Audio.Speech.stop();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await Audio.Speech.speak(response, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      console.error('Speech failed:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Assistant</Text>
        <Text style={styles.subtitle}>Tap and hold to speak with AI</Text>
      </View>

      <View style={styles.content}>
        <VoiceVisualizer isActive={isRecording} />

        <Animated.View style={[styles.micContainer, animatedStyle]}>
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonActive]}
            onPressIn={handleStartRecording}
            onPressOut={handleStopRecording}
            disabled={!isAvailable}
          >
            {isRecording ? (
              <MicOff size={32} color={theme.colors.onPrimary} />
            ) : (
              <Mic size={32} color={theme.colors.onPrimary} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {transcription ? (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionLabel}>You said:</Text>
            <Text style={styles.transcriptionText}>{transcription}</Text>
          </View>
        ) : null}

        {response ? (
          <View style={styles.responseContainer}>
            <View style={styles.responseHeader}>
              <Text style={styles.responseLabel}>AI Response:</Text>
              <TouchableOpacity
                style={styles.speakButton}
                onPress={speakResponse}
              >
                {isSpeaking ? (
                  <VolumeX size={20} color={theme.colors.primary} />
                ) : (
                  <Volume2 size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        ) : null}

        <Text style={styles.instructions}>
          {isRecording ? 'Release to stop recording' : 'Hold the microphone button to start recording'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.onBackground,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  micContainer: {
    marginVertical: 32,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6750A4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  micButtonActive: {
    backgroundColor: '#D32F2F',
  },
  transcriptionContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  transcriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  transcriptionText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  responseContainer: {
    width: '100%',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onPrimaryContainer,
    fontFamily: 'Inter-Bold',
  },
  speakButton: {
    padding: 4,
  },
  responseText: {
    fontSize: 16,
    color: theme.colors.onPrimaryContainer,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  instructions: {
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginTop: 24,
    fontFamily: 'Inter-Regular',
  },
});