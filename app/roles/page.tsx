import AppShell from "../../components/AppShell";
import RolesView from "../../components/views/RolesView";

export default function Page() {
  return (
    <AppShell active="roles">
      <RolesView />
    </AppShell>
  );
}
