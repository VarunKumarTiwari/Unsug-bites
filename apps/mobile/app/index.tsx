import { Redirect } from 'expo-router';

// Entry: send the user to onboarding. A real app would check auth + onboarding-complete state here.
export default function Index() {
  return <Redirect href="/(onboarding)/splash" />;
}
