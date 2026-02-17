import { getCurrentUser } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return <div>Dashboard - Welcome to the league, {user.firstName}!</div>;
}
