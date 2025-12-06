import React from 'react';
import { View, Text, Image } from 'react-native';
import { cn } from '../../utils/cn';

interface AvatarProps {
  children?: React.ReactNode;
  className?: string;
}

interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

export function Avatar({ children, className }: AvatarProps) {
  return (
    <View
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
    >
      {children}
    </View>
  );
}

export function AvatarImage({ src, alt, className }: AvatarImageProps) {
  if (!src) return null;
  
  return (
    <Image
      source={{ uri: src }}
      alt={alt}
      className={cn('aspect-square h-full w-full', className)}
      style={{ resizeMode: 'cover' }}
    />
  );
}

export function AvatarFallback({ children, className }: AvatarFallbackProps) {
  return (
    <View
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        className
      )}
    >
      <Text className="text-sm font-medium text-muted-foreground">
        {children}
      </Text>
    </View>
  );
}
