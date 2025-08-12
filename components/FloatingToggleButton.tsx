import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Power, Zap, ZapOff } from 'lucide-react-native';
import { sessionManager } from '@/services/SessionManager';
import { useTheme } from '@/hooks/useTheme';

const { width, height } = Dimensions.get('window');

interface FloatingToggleButtonProps {
  onToggle?: (isActive: boolean) => void;
}

export function FloatingToggleButton({ onToggle }: FloatingToggleButtonProps) {
  const { theme } = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position] = useState(new Animated.ValueXY({ x: width - 80, y: height / 2 }));
  const [scale] = useState(new Animated.Value(1));

  useEffect(() => {
    const handleSessionStateChange = (state: any) => {
      setIsActive(state.isActive);
      setIsLoading(false);
    };

    sessionManager.addSessionCallback(handleSessionStateChange);
    
    return () => {
      sessionManager.removeSessionCallback(handleSessionStateChange);
    };
  }, []);

  const handleToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      const success = await sessionManager.toggleAISession();
      if (success) {
        onToggle?.(!isActive);
      }
    } catch (error) {
      console.error('Toggle failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const panResponder = React.useRef(
    Animated.event(
      [null, { dx: position.x, dy: position.y }],
      { useNativeDriver: false }
    )
  ).current;

  const styles = createStyles(theme, isActive);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { scale },
          ],
        },
      ]}
      {...panResponder}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={handleToggle}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          {isLoading ? (
            <Power size={24} color={theme.colors.onPrimary} />
          ) : isActive ? (
            <Zap size={24} color={theme.colors.onPrimary} />
          ) : (
            <ZapOff size={24} color={theme.colors.onPrimary} />
          )}
        </View>
        
        <Text style={styles.buttonText}>
          {isLoading ? 'LOADING' : isActive ? 'STOP AI' : 'START AI'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (theme: any, isActive: boolean) => StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    elevation: 10,
  },
  button: {
    backgroundColor: isActive ? '#D32F2F' : theme.colors.primary,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    minWidth: 120,
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
});