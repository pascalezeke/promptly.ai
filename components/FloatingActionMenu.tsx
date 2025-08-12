import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Mic, Camera, Image, FileText } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';

const { height } = Dimensions.get('window');

interface FloatingActionMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function FloatingActionMenu({ visible, onClose }: FloatingActionMenuProps) {
  const { theme } = useTheme();
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(height, { damping: 20, stiffness: 90 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const actions = [
    { icon: Mic, label: 'Voice', color: '#E53E3E' },
    { icon: Camera, label: 'Camera', color: '#38A169' },
    { icon: Image, label: 'Gallery', color: '#3182CE' },
    { icon: FileText, label: 'Document', color: '#D69E2E' },
  ];

  const handleAction = (action: string) => {
    console.log(`${action} action triggered`);
    onClose();
  };

  const styles = createStyles(theme);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, animatedStyle]}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      
      <BlurView intensity={20} style={styles.menuContainer}>
        <View style={styles.actionsGrid}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              onPress={() => handleAction(action.label)}
            >
              <action.icon size={24} color="white" />
            </TouchableOpacity>
          ))}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});