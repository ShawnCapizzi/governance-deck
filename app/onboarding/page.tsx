import AppShell from "../../components/AppShell";
import OnboardingView from "../../components/views/OnboardingView";

export default function Page() {
  return (
    <AppShell active="team">
      <OnboardingView />
    </AppShell>
  );
}
