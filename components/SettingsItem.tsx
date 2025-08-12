import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, Video as LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface SettingsItemProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  rightComponent?: ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
}

export function SettingsItem({
  icon: Icon,
  title,
  subtitle,
  rightComponent,
  showChevron = false,
  onPress,
}: SettingsItemProps) {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Icon size={20} color={theme.colors.primary} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.rightSection}>
        {rightComponent}
        {showChevron && (
          <ChevronRight size={20} color={theme.colors.onSurfaceVariant} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    marginVertical: 2,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});