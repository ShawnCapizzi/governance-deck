// SSR gate entry: renders every view inside the real shell and provider.
import React from "react";
import { renderToString } from "react-dom/server";
import { SessionProvider } from "../lib/store";
import AppShell, { NavKey } from "../components/AppShell";
import HealthView from "../components/views/HealthView";
import GatherView from "../components/views/GatherView";
import ConvergeView from "../components/views/ConvergeView";
import ArtifactsView from "../components/views/ArtifactsView";
import StartView from "../components/views/StartView";
import RolesView from "../components/views/RolesView";
import TeamView from "../components/views/TeamView";
import SignInView from "../components/views/SignInView";
import OnboardingView from "../components/views/OnboardingView";

export function renderAll(): Record<string, string> {
  const wrap = (active: NavKey, node: React.ReactNode) =>
    renderToString(
      <SessionProvider>
        <AppShell active={active}>{node}</AppShell>
      </SessionProvider>
    );
  return {
    start: wrap("start", <StartView />),
    roles: wrap("roles", <RolesView />),
    team: wrap("team", <TeamView />),
    signin: wrap("start", <SignInView />),
    onboarding: wrap("team", <OnboardingView />),
    health: wrap("health", <HealthView />),
    gather: wrap("gather", <GatherView />),
    converge: wrap("converge", <ConvergeView />),
    artifacts: wrap("artifacts", <ArtifactsView />),
  };
}
