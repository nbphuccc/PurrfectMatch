import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
// import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs initialRouteName="profile"
      screenOptions={({ route }) => ({
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      // tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
      headerShown: true,
      tabBarButton: HapticTab,
      headerTitleAlign: "center",

      tabBarIcon: ({ color, focused }) => {
        if (route.name === "index") {
        return <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />;
        }
        if (route.name === "PlayDate") {
        return <Ionicons name={focused ? "calendar-clear" : "calendar-clear-outline"} size={24} color={color} />;
        }
        if (route.name === "profile") {
        return <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />;
        }
        return null;
      }
      })}
    >
      <Tabs.Screen
      name="index"
      options={{
        title: 'Community',
      }}
      />

      <Tabs.Screen
      name="PlayDate"
      options={{
        title: 'PlayDate',
      }}
      />

      <Tabs.Screen
      name="profile"
      options={{
        title: 'profile',
      }}
      />
    </Tabs>
  );
}
