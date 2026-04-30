"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckSquare, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import styles from "../auth.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email address";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        setGlobalError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setGlobalError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {globalError && (
        <div className={styles.errorAlert} role="alert">
          <AlertCircle size={16} />
          <span>{globalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email address</label>
          <div className={styles.inputWrapper}>
            <Mail size={16} className={styles.inputIcon} />
            <input
              id="email"
              type="email"
              className={`form-input ${styles.inputWithIcon} ${errors.email ? "error" : ""}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
              autoFocus
            />
          </div>
          {errors.email && (
            <span className="form-error">
              <AlertCircle size={12} /> {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div className={styles.inputWrapper}>
            <Lock size={16} className={styles.inputIcon} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={`form-input ${styles.inputWithIcon} ${styles.inputWithAction} ${errors.password ? "error" : ""}`}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.inputAction}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <span className="form-error">
              <AlertCircle size={12} /> {errors.password}
            </span>
          )}
        </div>

        <button
          id="login-submit-btn"
          type="submit"
          className={`btn btn-primary ${styles.submitBtn}`}
          disabled={isLoading}
        >
          {isLoading ? <><div className="spinner" /> Signing in…</> : "Sign in"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          <CheckSquare size={24} strokeWidth={2.5} />
          <span>Taskify</span>
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to your account to continue</p>
        </div>

        <Suspense fallback={<div className="spinner" />}>
          <LoginForm />
        </Suspense>

        <p className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/register">Create one for free</Link>
        </p>
      </div>
    </div>
  );
}
