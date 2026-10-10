import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { DesktopNav } from '@/components/navigation/desktop-nav';

export default function TabLayout() {
  const { isMobile } = useResponsive();

  return (
    <View style={{ flex: 1, backgroundColor: Palette.slate50 }}>
      <DesktopNav />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Palette.primary600,
          tabBarInactiveTintColor: Palette.slate400,
          tabBarStyle: isMobile
            ? {
                backgroundColor: Palette.white,
                borderTopColor: Palette.slate200,
                borderTopWidth: 1,
                height: Platform.OS === 'android' ? 64 : 60,
                paddingBottom: Platform.OS === 'android' ? 8 : 6,
                paddingTop: 6,
              }
            : {
                display: 'none',
              },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Marketplace',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'briefcase' : 'briefcase-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
