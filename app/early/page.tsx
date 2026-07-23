import type { Metadata } from "next";
import EarlyView from "../../components/views/EarlyView";
import { ParticleField } from "../../components/ParticleField";

export const metadata: Metadata = {
  title: "Governance Deck: find out what your team actually agrees on",
  description:
    "Most teams lose speed to decisions nobody actually made. Find where your team is split, settle it on the record, and turn the answers into documents your business can run on. Ten minutes per person, no meeting.",
};

export default function Page() {
  return (
    <>
      <ParticleField />
      <EarlyView />
    </>
  );
}
