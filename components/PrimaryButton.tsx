import { useAccessibility } from '@/contexts/AccessibilityContext'
import { theme } from '@/theme/colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native'

interface PrimaryButtonProps {
  label: string
  onPress?: () => void
  variant?: 'default' | 'outline'
  iconName?: React.ComponentProps<typeof Ionicons>['name']
  style?: ViewStyle
  disabled?: boolean
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'default',
  iconName,
  style,
  disabled,
}: PrimaryButtonProps) {
  const isOutline = variant === 'outline'
  const { scaleFont } = useAccessibility()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        isOutline ? styles.buttonOutline : styles.buttonDefault,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      {iconName ? (
        <Ionicons
          name={iconName}
          size={scaleFont(18)}
          color={isOutline ? theme.primaryForeground : theme.primary}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          { color: isOutline ? theme.primaryForeground : theme.primary, fontSize: scaleFont(14) },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
  },
  buttonDefault: {
    backgroundColor: theme.primaryForeground,
    borderColor: 'transparent',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderColor: theme.primaryForeground,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    fontWeight: '600',
  },
})

