import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <AppSidebar role={session.user.role} userName={session.user.name ?? session.user.username} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AppHeader role={session.user.role} userName={session.user.name ?? session.user.username} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}