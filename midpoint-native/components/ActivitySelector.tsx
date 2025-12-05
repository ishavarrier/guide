import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Coffee, ShoppingBag, Utensils } from "lucide-react-native";
import { selectionHaptic } from "../utils/haptics";
import { colors } from "../constants/theme";

interface ActivitySelectorProps {
  selected: string;
  onSelect: (activity: string) => void;
}

export function ActivitySelector({
  selected,
  onSelect,
}: ActivitySelectorProps) {
  const activities = [
    { id: "restaurants", label: "Restaurants", icon: Utensils },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
    { id: "cafes", label: "Cafes", icon: Coffee },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Type</Text>
      <View style={styles.activitiesContainer}>
        {activities.map((activity) => {
          const Icon = activity.icon;
          const isSelected = selected === activity.id;

          return (
            <Pressable
              key={activity.id}
              onPress={() => {
                selectionHaptic();
                onSelect(activity.id);
              }}
              style={({ pressed }) => [
                styles.activityButton,
                isSelected
                  ? styles.activityButtonSelected
                  : styles.activityButtonUnselected,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Icon size={24} color={isSelected ? colors.icon.white : colors.icon.muted} />
              <Text
                style={[
                  styles.activityText,
                  isSelected
                    ? styles.activityTextSelected
                    : styles.activityTextUnselected,
                ]}
              >
                {activity.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.foreground,
    marginBottom: 12,
  },
  activitiesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  activityButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  activityButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activityButtonUnselected: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  activityText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activityTextSelected: {
    color: colors.white,
  },
  activityTextUnselected: {
    color: colors.foreground,
  },
});
