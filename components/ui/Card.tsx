import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <View className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {children}
    </View>
  );
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <View className={cn('p-6 pt-0', className)}>
      {children}
    </View>
  );
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <Text className={cn('text-2xl font-semibold leading-none tracking-tight', className)}>
      {children}
    </Text>
  );
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <Text className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </Text>
  );
}
