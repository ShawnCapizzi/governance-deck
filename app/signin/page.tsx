import AppShell from "../../components/AppShell";
import SignInView from "../../components/views/SignInView";

export default function Page() {
  return (
    <AppShell active="start">
      <SignInView />
    </AppShell>
  );
}
