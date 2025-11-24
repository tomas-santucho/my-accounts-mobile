export const palette = {
    // Primary Brand Colors (Blue/Purple gradient feel)
    primary: '#4F46E5', // Indigo 600
    primaryLight: '#818CF8', // Indigo 400
    primaryDark: '#3730A3', // Indigo 800

    // Secondary/Accent
    accent: '#F472B6', // Pink 400
    accentGradientStart: '#4F46E5',
    accentGradientEnd: '#EC4899',

    // Success/Error/Warning
    success: '#10B981', // Emerald 500
    error: '#EF4444', // Red 500
    warning: '#F59E0B', // Amber 500
    info: '#3B82F6', // Blue 500

    // Neutrals - Light
    white: '#FFFFFF',
    backgroundLight: '#F7F8FC',
    surfaceLight: '#FFFFFF',
    textPrimaryLight: '#1F2937', // Gray 800
    textSecondaryLight: '#6B7280', // Gray 500
    borderLight: '#E5E7EB', // Gray 200

    // Neutrals - Dark
    backgroundDark: '#0F172A', // Slate 900
    surfaceDark: '#1E293B', // Slate 800
    textPrimaryDark: '#F3F4F6', // Gray 100
    textSecondaryDark: '#9CA3AF', // Gray 400
    borderDark: '#334155', // Slate 700
};

export const lightTheme = {
    mode: 'light',
    colors: {
        background: palette.backgroundLight,
        surface: palette.surfaceLight,
        primary: palette.primary,
        secondary: palette.accent,
        textPrimary: palette.textPrimaryLight,
        textSecondary: palette.textSecondaryLight,
        border: palette.borderLight,
        error: palette.error,
        success: palette.success,
        warning: palette.warning,
        info: palette.info,
        cardBackground: palette.white,
        tabBarBackground: palette.white,
        tabBarActive: palette.primary,
        tabBarInactive: palette.textSecondaryLight,
        inputBackground: '#F3F4F6', // Gray 100
        placeholder: '#9CA3AF',
        divider: '#E5E7EB',
        modalBackground: palette.white,
        primaryDark: palette.primaryDark,
        onPrimary: palette.white,
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
    },
    borderRadius: {
        s: 8,
        m: 12,
        l: 16,
        xl: 24,
        round: 9999,
    }
};

export const darkTheme = {
    mode: 'dark',
    colors: {
        background: palette.backgroundDark,
        surface: palette.surfaceDark,
        primary: palette.primaryLight, // Lighter for dark mode
        secondary: palette.accent,
        textPrimary: palette.textPrimaryDark,
        textSecondary: palette.textSecondaryDark,
        border: palette.borderDark,
        error: '#F87171', // Red 400
        success: '#34D399', // Emerald 400
        warning: '#FBBF24', // Amber 400
        info: '#60A5FA', // Blue 400
        cardBackground: palette.surfaceDark,
        tabBarBackground: palette.surfaceDark,
        tabBarActive: palette.primaryLight,
        tabBarInactive: palette.textSecondaryDark,
        inputBackground: '#334155', // Slate 700
        placeholder: '#64748B',
        divider: '#334155',
        modalBackground: palette.surfaceDark,
        primaryDark: palette.primaryDark, // Keep it dark or maybe lighter? Let's keep it dark for header
        onPrimary: palette.white, // Text on primary is usually white
    },
    spacing: lightTheme.spacing,
    borderRadius: lightTheme.borderRadius,
};

export type Theme = typeof lightTheme;
