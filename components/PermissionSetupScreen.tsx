import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Shield, Mic, Eye, Smartphone, CircleCheck as CheckCircle, CircleAlert as AlertCircle, ArrowRight } from 'lucide-react-native';
import { sessionManager } from '@/services/SessionManager';
import { useTheme } from '@/hooks/useTheme';

interface PermissionItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  granted: boolean;
  required: boolean;
}

interface PermissionSetupScreenProps {
  onComplete: () => void;
}

export function PermissionSetupScreen({ onComplete }: PermissionSetupScreenProps) {
  const { theme } = useTheme();
  const [permissions, setPermissions] = useState<PermissionItem[]>([
    {
      id: 'overlay',
      title: 'Display over other apps',
      description: 'Required to show AI suggestions on top of other applications',
      icon: Smartphone,
      granted: false,
      required: true,
    },
    {
      id: 'accessibility',
      title: 'Accessibility Service',
      description: 'Allows reading text from WhatsApp, Messenger, and other apps',
      icon: Eye,
      granted: false,
      required: true,
    },
    {
      id: 'microphone',
      title: 'Microphone Access',
      description: 'Enables voice transcription during calls and conversations',
      icon: Mic,
      granted: false,
      required: true,
    },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    // This would check actual permission status
    // For now, we'll simulate the check
    console.log('Checking permission status...');
  };

  const requestPermission = async (permissionId: string) => {
    setIsRequestingPermissions(true);

    try {
      let granted = false;

      switch (permissionId) {
        case 'overlay':
        case 'accessibility':
        case 'microphone':
          granted = await sessionManager.requestAllPermissions();
          break;
      }

      setPermissions(prev =>
        prev.map(p =>
          p.id === permissionId ? { ...p, granted } : p
        )
      );

      if (granted) {
        if (currentStep < permissions.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      } else {
        Alert.alert(
          'Permission Required',
          'This permission is required for the AI assistant to work properly. Please grant it in the system settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      Alert.alert('Error', 'Failed to request permission. Please try again.');
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  const handleContinue = () => {
    const allRequiredGranted = permissions
      .filter(p => p.required)
      .every(p => p.granted);

    if (allRequiredGranted) {
      onComplete();
    } else {
      Alert.alert(
        'Permissions Required',
        'Please grant all required permissions to continue.',
        [{ text: 'OK' }]
      );
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Shield size={48} color={theme.colors.primary} />
          <Text style={styles.title}>Setup Permissions</Text>
          <Text style={styles.subtitle}>
            Grant these permissions to enable AI assistance across all your apps
          </Text>
        </View>

        <View style={styles.permissionsList}>
          {permissions.map((permission, index) => (
            <View
              key={permission.id}
              style={[
                styles.permissionItem,
                index === currentStep && styles.currentPermissionItem,
              ]}
            >
              <View style={styles.permissionHeader}>
                <View style={styles.permissionIcon}>
                  <permission.icon
                    size={24}
                    color={permission.granted ? theme.colors.success : theme.colors.primary}
                  />
                </View>
                
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionTitle}>{permission.title}</Text>
                  <Text style={styles.permissionDescription}>
                    {permission.description}
                  </Text>
                </View>

                <View style={styles.permissionStatus}>
                  {permission.granted ? (
                    <CheckCircle size={24} color={theme.colors.success} />
                  ) : (
                    <AlertCircle size={24} color={theme.colors.warning} />
                  )}
                </View>
              </View>

              {!permission.granted && index === currentStep && (
                <TouchableOpacity
                  style={styles.grantButton}
                  onPress={() => requestPermission(permission.id)}
                  disabled={isRequestingPermissions}
                >
                  <Text style={styles.grantButtonText}>
                    {isRequestingPermissions ? 'Requesting...' : 'Grant Permission'}
                  </Text>
                  <ArrowRight size={16} color={theme.colors.onPrimary} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Setup Instructions:</Text>
          <Text style={styles.instructionsText}>
            1. Tap "Grant Permission" for each required permission{'\n'}
            2. Follow the system prompts to enable each service{'\n'}
            3. Return to the app once all permissions are granted{'\n'}
            4. Your AI assistant will be ready to help across all apps
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !permissions.filter(p => p.required).every(p => p.granted) &&
              styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!permissions.filter(p => p.required).every(p => p.granted)}
        >
          <Text style={styles.continueButtonText}>Continue to App</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.onBackground,
    marginTop: 16,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  permissionsList: {
    gap: 16,
    marginBottom: 32,
  },
  permissionItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  currentPermissionItem: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  permissionDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  permissionStatus: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grantButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  grantButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  instructions: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 12,
    fontFamily: 'Inter-Bold',
  },
  instructionsText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
  footer: {
    padding: 24,
    backgroundColor: theme.colors.surface,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  continueButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
});