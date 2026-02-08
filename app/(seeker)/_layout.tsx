import { Tabs } from 'expo-router';
import { AnimatedTabIcon } from '../../components/animated';
import { COLORS } from '../../constants/colors';

export default function SeekerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="home-outline" size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="coaches"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="compass-outline" size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="enrollments"
        options={{
          title: 'My Coaches',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="people-outline" size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="notion"
        options={{
          title: 'Notion',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name="book-outline" size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
