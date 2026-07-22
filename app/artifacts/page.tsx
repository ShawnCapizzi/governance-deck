import AppShell from "../../components/AppShell";
import ArtifactsView from "../../components/views/ArtifactsView";

export default function Page() {
  return (
    <AppShell active="artifacts">
      <ArtifactsView />
    </AppShell>
  );
}
