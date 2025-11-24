import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';

interface ThemedCardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({ title, subtitle, children }) => {
  const { colors, spacing, typography } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginVertical: spacing.sm,
      marginHorizontal: spacing.md,
      elevation: 2,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: typography.h2.fontSize,
      fontWeight: typography.h2.fontWeight as any,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: typography.body.fontSize,
      fontWeight: typography.body.fontWeight as any,
      color: colors.textSecondary,
      marginBottom: children ? spacing.sm : 0,
    },
    content: {
      // Contenido adicional
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
};

export default ThemedCard;
