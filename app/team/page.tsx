import AppShell from "../../components/AppShell";
import TeamView from "../../components/views/TeamView";

export default function Page() {
  return (
    <AppShell active="team">
      <TeamView />
    </AppShell>
  );
}
