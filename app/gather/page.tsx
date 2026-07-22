import AppShell from "../../components/AppShell";
import GatherView from "../../components/views/GatherView";

export default function Page() {
  return (
    <AppShell active="gather">
      <GatherView />
    </AppShell>
  );
}
