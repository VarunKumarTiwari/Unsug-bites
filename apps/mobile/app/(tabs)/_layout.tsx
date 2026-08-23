import { Tabs } from 'expo-router';
import { NavChromeProvider } from '@/lib/navChrome';
import { FloatingTabBar } from '@/components/nav/FloatingTabBar';

export default function TabsLayout() {
  return (
    <NavChromeProvider>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <FloatingTabBar {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="history" options={{ title: 'History' }} />
        <Tabs.Screen name="scan" options={{ title: 'Scan' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        {/* Detail screens — inside tab navigator so the pill stays visible */}
        <Tabs.Screen name="restaurant/[id]" options={{ href: null }} />
      </Tabs>
    </NavChromeProvider>
  );
}
