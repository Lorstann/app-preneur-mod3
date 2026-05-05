import { auth } from "@clerk/nextjs/server";
import { LandingHero } from "@/components/shared/landing-hero";

export default async function Home() {
  const { userId } = await auth();
  return <LandingHero isAuthenticated={!!userId} />;
}
