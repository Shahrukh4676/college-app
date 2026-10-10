import { Redirect } from 'expo-router';

export default function RootLoginRedirect() {
  return <Redirect href="/(auth)/login" />;
}
