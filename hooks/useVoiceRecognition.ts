import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export function useVoiceRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setIsAvailable(status === 'granted');
    } catch (error) {
      console.error('Permission check failed:', error);
      setIsAvailable(false);
    }
  };

  const startRecording = async (): Promise<string | null> => {
    if (!isAvailable || isRecording) return null;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      
      return 'Recording started...';
    } catch (error) {
      console.error('Failed to start recording:', error);
      return null;
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    if (!recording || !isRecording) return null;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecording(null);

      // In a real implementation, you would process the audio file here
      // For now, return a simulated transcription
      return 'This is a simulated transcription of your voice input.';
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  };

  return {
    startRecording,
    stopRecording,
    isRecording,
    isAvailable,
  };
}