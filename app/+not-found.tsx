import { Link, Stack, router } from 'expo-router';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, AlertCircle } from 'lucide-react-native';
import { colors } from '../constants/theme';
import { Button } from '../components/ui/Button';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <SafeAreaView style={styles.container} className="bg-background">
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertCircle size={64} color={colors.primary} />
          </View>
          <Text style={styles.title}>Page Not Found</Text>
          <Text style={styles.subtitle}>
            The screen you're looking for doesn't exist.
          </Text>
          
          <Button
            onPress={() => router.push('/')}
            className="mt-8"
            size="lg"
          >
            <Home size={20} color={colors.icon.white} />
            <Text className="ml-2 text-primary-foreground">Go to Home</Text>
          </Button>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedForeground,
    textAlign: 'center',
    maxWidth: 300,
  },
});
