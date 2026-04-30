import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import styles from "./layout.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className={styles.layout}>
      <Navbar user={session.user} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
