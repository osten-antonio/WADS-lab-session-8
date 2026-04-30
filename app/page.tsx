import Link from "next/link";
import styles from "./page.module.css";
import { CheckSquare, Zap, Shield, Smartphone } from "lucide-react";

export default function LandingPage() {
  return (
    <main className={styles.main}>
      {/* Background blobs */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <div className={styles.logo}>
            <CheckSquare size={24} strokeWidth={2.5} />
            <span>Taskify</span>
          </div>
          <div className={styles.navLinks}>
            <Link href="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <Zap size={12} />
            <span>Simple. Powerful. Beautiful.</span>
          </div>
          <h1 className={styles.heroTitle}>
            Organize your life,
            <br />
            <span className={styles.heroGradient}>one task at a time.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Taskify is a beautifully crafted todo app with priority management,
            secure authentication, and a clean modern experience that keeps you
            focused on what matters.
          </p>
          <div className={styles.heroCta}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Start for free
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Sign in
            </Link>
          </div>
        </div>

        {/* Hero Preview Card */}
        <div className={styles.heroPreview}>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <div className={styles.previewDots}>
                <span />
                <span />
                <span />
              </div>
              <span className={styles.previewTitle}>My Tasks</span>
            </div>
            <div className={styles.previewItems}>
              {[
                { text: "Design new landing page", done: true, p: "HIGH" },
                { text: "Review pull requests", done: true, p: "MEDIUM" },
                { text: "Write unit tests", done: false, p: "HIGH" },
                { text: "Update documentation", done: false, p: "LOW" },
                { text: "Deploy to production", done: false, p: "MEDIUM" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`${styles.previewItem} ${item.done ? styles.previewItemDone : ""}`}
                >
                  <div
                    className={`${styles.previewCheck} ${item.done ? styles.previewCheckDone : ""}`}
                  >
                    {item.done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M2 5l2.5 2.5L8 3"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className={styles.previewText}>{item.text}</span>
                  <span
                    className={`badge badge-${item.p.toLowerCase()} ${styles.previewBadge}`}
                  >
                    {item.p}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.featuresTitle}>Everything you need</h2>
          <div className={styles.featuresGrid}>
            {[
              {
                icon: <Shield size={22} />,
                title: "Secure Auth",
                desc: "Login with email & password or GitHub OAuth — your data is always private.",
              },
              {
                icon: <Zap size={22} />,
                title: "Priority Management",
                desc: "Tag tasks as Low, Medium, or High priority so you always tackle what matters first.",
              },
              {
                icon: <CheckSquare size={22} />,
                title: "Full CRUD",
                desc: "Create, view, edit, complete, and delete tasks with instant feedback.",
              },
              {
                icon: <Smartphone size={22} />,
                title: "Responsive Design",
                desc: "A seamless experience across desktop, tablet, and mobile devices.",
              },
            ].map((f, i) => (
              <div key={i} className={`card ${styles.featureCard}`}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={`container ${styles.ctaInner}`}>
          <h2 className={styles.ctaTitle}>Ready to get organized?</h2>
          <p className={styles.ctaDesc}>
            Join thousands of users who use Taskify to stay productive.
          </p>
          <Link href="/register" className="btn btn-primary btn-lg">
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.logo}>
            <CheckSquare size={18} />
            <span>Taskify</span>
          </div>
          <p className={styles.footerText}>
            Built with Next.js · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  );
}
