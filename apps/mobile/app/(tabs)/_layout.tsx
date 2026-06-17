import { Tabs } from 'expo-router';
import { Home, Clock, Camera, User } from 'lucide-react-native';
import { color, fonts } from '@/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.accent,
        tabBarInactiveTintColor: color.inkSubtle,
        tabBarStyle: {
          backgroundColor: color.surface,
          borderTopColor: color.stone,
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMed,
          fontSize: 11,
          letterSpacing: 0.4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color: c, size }) => <Home size={size - 2} color={c} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color: c, size }) => <Clock size={size - 2} color={c} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color: c, size }) => <Camera size={size - 2} color={c} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color: c, size }) => <User size={size - 2} color={c} />,
        }}
      />
      {/* Detail screens — inside tab navigator so the tab bar stays visible */}
      <Tabs.Screen
        name="restaurant/[id]"
        options={{ href: null }}
      />
    </Tabs>
  );
}
