"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckSquare, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    else if (form.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email address";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!form.confirm) newErrors.confirm = "Please confirm your password";
    else if (form.confirm !== form.password) newErrors.confirm = "Passwords do not match";
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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setGlobalError("An account with this email already exists.");
        else if (data.details) {
          const fieldErrors: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.details)) {
            fieldErrors[k] = (v as string[])[0];
          }
          setErrors(fieldErrors);
        } else {
          setGlobalError(data.error ?? "Registration failed.");
        }
        return;
      }
      setSuccess(true);
      setTimeout(async () => {
        await signIn("credentials", {
          email: form.email,
          password: form.password,
          callbackUrl: "/dashboard",
          redirect: true,
        });
      }, 1000);
    } catch {
      setGlobalError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.subtitle}>Start organizing your tasks today — for free</p>
        </div>

        {globalError && (
          <div className={styles.errorAlert} role="alert">
            <AlertCircle size={16} />
            <span>{globalError}</span>
          </div>
        )}

        {success && (
          <div className={styles.successAlert} role="status">
            <CheckCircle size={16} />
            <span>Account created! Signing you in…</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full name</label>
            <div className={styles.inputWrapper}>
              <User size={16} className={styles.inputIcon} />
              <input
                id="name"
                type="text"
                className={`form-input ${styles.inputWithIcon} ${errors.name ? "error" : ""}`}
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>
            {errors.name && <span className="form-error"><AlertCircle size={12} /> {errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email address</label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                id="reg-email"
                type="email"
                className={`form-input ${styles.inputWithIcon} ${errors.email ? "error" : ""}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="form-error"><AlertCircle size={12} /> {errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                className={`form-input ${styles.inputWithIcon} ${styles.inputWithAction} ${errors.password ? "error" : ""}`}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
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
            {errors.password && <span className="form-error"><AlertCircle size={12} /> {errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirm" className="form-label">Confirm password</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                className={`form-input ${styles.inputWithIcon} ${errors.confirm ? "error" : ""}`}
                placeholder="Re-enter password"
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                autoComplete="new-password"
              />
            </div>
            {errors.confirm && <span className="form-error"><AlertCircle size={12} /> {errors.confirm}</span>}
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={isLoading || success}
          >
            {isLoading ? <><div className="spinner" /> Creating account…</> : "Create account"}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
