import AppShell from "../components/AppShell";
import HealthView from "../components/views/HealthView";

export default function Page() {
  return (
    <AppShell active="health">
      <HealthView />
    </AppShell>
  );
}
