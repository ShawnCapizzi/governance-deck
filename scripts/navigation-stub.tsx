// SSR gate stub for next/navigation. The gate renders outside the Next
// runtime, so router hooks are replaced with inert equivalents. Not used
// in production builds.

export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    refresh: () => {},
    back: () => {},
    forward: () => {},
    prefetch: () => {},
  };
}
export function usePathname() { return "/"; }
export function useSearchParams() { return new URLSearchParams(); }
export function redirect() {}
