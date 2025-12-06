import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSegments, useRouter } from "expo-router";
import { Home, Calendar, Plus, UserPlus } from "lucide-react-native";
import { colors } from "../constants/theme";
import { successHaptic } from "../utils/haptics";

type NavItem = {
  route: string;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
};

const navItems: NavItem[] = [
  { route: "/home", label: "Home", icon: Home },
  { route: "/events", label: "Events", icon: Calendar },
  { route: "/locations", label: "Create", icon: Plus },
  { route: "/add-friends", label: "Friends", icon: UserPlus },
];

export default function Navbar() {
  const segments = useSegments();
  const router = useRouter();

  // Construct pathname from segments
  const pathname = segments.length > 0 ? "/" + segments.join("/") : "/";

  const handlePress = (route: string) => {
    successHaptic();
    // Use replace instead of push for instant tab switching (no animation)
    router.replace(route as any);
  };

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const Icon = item.icon;
        // Handle index route (/) as home
        const isActive =
          pathname === item.route ||
          (item.route === "/home" && (pathname === "/" || pathname === ""));
        const iconColor = isActive ? colors.primary : colors.mutedForeground;
        const textColor = isActive ? colors.primary : colors.mutedForeground;

        return (
          <Pressable
            key={item.route}
            onPress={() => handlePress(item.route)}
            style={({ pressed }) => [
              styles.navItem,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Icon size={24} color={iconColor} />
            <Text style={[styles.navLabel, { color: textColor }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});
