import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  Settings as SettingsIcon,
  Palette,
  Volume2,
  Bell,
  Zap,
  Eye,
  Key,
  Shield,
  Info,
  Trash2,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/hooks/useSettings';
import { SettingsSection } from '@/components/SettingsSection';
import { SettingsItem } from '@/components/SettingsItem';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { settings, updateSetting, setApiKey } = useSettings();
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleApiKeySubmit = async () => {
    if (apiKeyInput.trim()) {
      await setApiKey(apiKeyInput.trim());
      setApiKeyInput('');
      setShowApiKeyInput(false);
      Alert.alert('Success', 'API key has been updated successfully.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all conversations and reset settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Implement data clearing logic
            Alert.alert('Success', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your AI experience</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsSection title="AI Configuration">
          <SettingsItem
            icon={Key}
            title="API Key"
            subtitle={settings.apiKeyConfigured ? 'Configured' : 'Not configured'}
            rightComponent={
              <Text style={[styles.status, settings.apiKeyConfigured && styles.statusActive]}>
                {settings.apiKeyConfigured ? 'Active' : 'Required'}
              </Text>
            }
            onPress={() => setShowApiKeyInput(true)}
            showChevron
          />
          
          <SettingsItem
            icon={Zap}
            title="Auto-start AI"
            subtitle="Start AI services when app opens"
            rightComponent={
              <Switch
                value={settings.autoStartAI}
                onValueChange={(value) => updateSetting('autoStartAI', value)}
                trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
                thumbColor={theme.colors.onPrimary}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Interface">
          <SettingsItem
            icon={Palette}
            title="Theme"
            subtitle={`Current: ${settings.theme}`}
            rightComponent={
              <Text style={styles.value}>{settings.theme}</Text>
            }
            showChevron
          />
          
          <SettingsItem
            icon={Eye}
            title="Overlay Opacity"
            subtitle={`${Math.round(settings.overlayOpacity * 100)}%`}
            rightComponent={
              <Text style={styles.value}>{Math.round(settings.overlayOpacity * 100)}%</Text>
            }
            showChevron
          />
        </SettingsSection>

        <SettingsSection title="Features">
          <SettingsItem
            icon={Volume2}
            title="Voice Input"
            subtitle="Enable voice recognition"
            rightComponent={
              <Switch
                value={settings.voiceEnabled}
                onValueChange={(value) => updateSetting('voiceEnabled', value)}
                trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
                thumbColor={theme.colors.onPrimary}
              />
            }
          />
          
          <SettingsItem
            icon={Bell}
            title="Notifications"
            subtitle="Show system notifications"
            rightComponent={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => updateSetting('notificationsEnabled', value)}
                trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
                thumbColor={theme.colors.onPrimary}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Privacy & Security">
          <SettingsItem
            icon={Shield}
            title="Permissions"
            subtitle="Manage app permissions"
            showChevron
          />
          
          <SettingsItem
            icon={Trash2}
            title="Clear All Data"
            subtitle="Delete conversations and reset settings"
            onPress={handleClearData}
            showChevron
          />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsItem
            icon={Info}
            title="Version"
            subtitle="1.0.0"
          />
        </SettingsSection>
      </ScrollView>

      {showApiKeyInput && (
        <View style={styles.apiKeyModal}>
          <View style={styles.apiKeyContainer}>
            <Text style={styles.apiKeyTitle}>Enter Gemini API Key</Text>
            <TextInput
              style={styles.apiKeyInput}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="AIzaSy..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              secureTextEntry
            />
            <View style={styles.apiKeyActions}>
              <TouchableOpacity
                style={[styles.apiKeyButton, styles.cancelButton]}
                onPress={() => {
                  setShowApiKeyInput(false);
                  setApiKeyInput('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.apiKeyButton, styles.submitButton]}
                onPress={handleApiKeySubmit}
              >
                <Text style={styles.submitButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    paddingHorizontal: 16,
  },
  status: {
    fontSize: 14,
    color: theme.colors.error,
    fontFamily: 'Inter-Regular',
  },
  statusActive: {
    color: theme.colors.success,
  },
  value: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'Inter-Regular',
  },
  apiKeyModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  apiKeyContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  apiKeyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.onSurface,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  apiKeyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  apiKeyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  submitButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
});