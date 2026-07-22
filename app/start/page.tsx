import AppShell from "../../components/AppShell";
import StartView from "../../components/views/StartView";

export default function Page() {
  return (
    <AppShell active="start">
      <StartView />
    </AppShell>
  );
}
