import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDefaultRouteForRole } from "@/lib/permissions";

export default async function DashboardRootRedirectPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  redirect(getDefaultRouteForRole(session.user.role));
}