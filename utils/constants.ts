export const COLORS = {
    primary: '#6750A4',
    secondary: '#625B71',
    accent: '#7D5260',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  };
  
  export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };
  
  export const TYPOGRAPHY = {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  };
  
  export const ANIMATIONS = {
    durations: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    springs: {
      gentle: { damping: 20, stiffness: 90 },
      bouncy: { damping: 15, stiffness: 100 },
      snappy: { damping: 25, stiffness: 120 },
    },
  };
  
  export const API_CONFIG = {
    HEY_BLUE_AI: {
      baseUrl: 'https://api.heyblue.ai',
      timeout: 30000,
      retryAttempts: 3,
    },
  };