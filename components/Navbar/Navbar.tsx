"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { CheckSquare, LogOut, User } from "lucide-react";
import styles from "./Navbar.module.css";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? "U";

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/dashboard" className={styles.logo}>
          <CheckSquare size={22} strokeWidth={2.5} />
          <span>Taskify</span>
        </Link>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? "User"}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarInitials}>{initials}</div>
            )}
            <div className={styles.userText}>
              <span className={styles.userName}>{user?.name ?? "User"}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </div>

          <button
            id="logout-btn"
            className={`btn btn-ghost btn-sm ${styles.logoutBtn}`}
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Sign out"
          >
            <LogOut size={16} />
            <span className={styles.logoutText}>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
