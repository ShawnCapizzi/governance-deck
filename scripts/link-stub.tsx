// SSR gate stub for next/link. The gate renders outside the Next runtime,
// so Link is aliased to a plain anchor. Not used in production builds.
import { ReactNode } from "react";

export default function Link({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return <a href={href} className={className}>{children}</a>;
}
