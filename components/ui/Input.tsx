import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { cn } from '../../utils/cn';

interface InputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'off' | 'name' | 'tel' | 'email' | 'street-address';
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  className,
  label,
  error,
}: InputProps) {
  return (
    <View className="space-y-2">
      {label && (
        <Text className="text-sm font-medium text-foreground">
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-input-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground',
          'focus:border-secondary focus:outline-none',
          error && 'border-destructive',
          className
        )}
        style={{
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {error && (
        <Text className="text-sm text-destructive">
          {error}
        </Text>
      )}
    </View>
  );
}
