import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { cn } from '../../utils/cn';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  className,
}: ButtonProps) {
  const baseClasses = 'flex-row items-center justify-center rounded-lg';
  
  const variantClasses = {
    default: 'bg-primary',
    destructive: 'bg-destructive',
    outline: 'border border-input bg-background',
    secondary: 'bg-secondary',
    ghost: 'bg-transparent',
    link: 'bg-transparent',
  };

  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  const textVariantClasses = {
    default: 'text-primary-foreground',
    destructive: 'text-destructive-foreground',
    outline: 'text-foreground',
    secondary: 'text-secondary-foreground',
    ghost: 'text-foreground',
    link: 'text-primary underline',
  };

  const textSizeClasses = {
    default: 'text-sm font-medium',
    sm: 'text-sm font-medium',
    lg: 'text-base font-medium',
    icon: 'text-sm font-medium',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50',
        className
      )}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        className={cn(
          textVariantClasses[variant],
          textSizeClasses[size]
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
}
