import type { Metadata } from "next";
import { WelcomeView } from "./welcome-view";

export const metadata: Metadata = { title: "Welcome", robots: { index: false, follow: true } };

export default function WelcomePage() {
  return <WelcomeView />;
}
