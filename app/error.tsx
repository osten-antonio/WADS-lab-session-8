"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import styles from "./error.module.css";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <AlertTriangle size={36} />
        </div>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.desc}>
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className={styles.digest}>Error ID: {error.digest}</p>
        )}
        <div className={styles.actions}>
          <button className="btn btn-primary" onClick={reset}>
            <RefreshCw size={16} />
            Try again
          </button>
          <Link href="/" className="btn btn-secondary">
            <Home size={16} />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
