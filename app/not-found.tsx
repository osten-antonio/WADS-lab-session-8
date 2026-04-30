import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import styles from "./error.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.notFoundNumber}>404</div>
        <div className={styles.icon}>
          <FileQuestion size={36} />
        </div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.desc}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Link href="/" className="btn btn-primary">
            <Home size={16} />
            Go home
          </Link>
          <Link href="/dashboard" className="btn btn-secondary">
            Open dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
