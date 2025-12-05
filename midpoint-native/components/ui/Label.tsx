import React from 'react';
import { Text, Pressable } from 'react-native';
import { cn } from '../../utils/cn';

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

export function Label({ children, className, onPress }: LabelProps) {
  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        <Text
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            className
          )}
        >
          {children}
        </Text>
      </Pressable>
    );
  }

  return (
    <Text
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
    >
      {children}
    </Text>
  );
}
