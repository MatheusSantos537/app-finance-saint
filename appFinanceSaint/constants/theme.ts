import { Platform } from 'react-native';
const palette = {
  
  greenPrimary: '#00B894', 
  greenSecondary: '#55E6C1',
  greenBackground: '#F0FDF4',

  
  white: '#FFFFFF',
  black: '#121212',
  greyLight: '#F8F9FA', 
  greyMedium: '#ADB5BD',
  
 
  darkBackground: '#1A1A1A',  
  darkCard: '#2C2C2E',  
  darkText: '#EFEFEF',  
};

 
export const lightTheme = {
  colors: {
    background: palette.white,
    card: palette.greyLight,
    text: palette.black,
    textSecondary: palette.greyMedium,
    primary: palette.greenPrimary,
    accent: palette.greenSecondary,
    border: palette.greyLight,
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
  },
  
};

 
export const darkTheme = {
  colors: {
    background: palette.darkBackground,
    card: palette.darkCard,
    text: palette.darkText, // Como você pediu, texto claro
    textSecondary: palette.greyMedium,
    primary: palette.greenPrimary, // O verde principal pode se manter vibrante
    accent: palette.greenSecondary,
    border: palette.darkCard,
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
  },
   
};


export type Theme = typeof lightTheme;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
