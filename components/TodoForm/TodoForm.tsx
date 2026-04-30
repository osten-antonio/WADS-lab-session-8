"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, Calendar, Flag } from "lucide-react";
import styles from "./TodoForm.module.css";

export interface TodoFormData {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string;
}

interface TodoFormProps {
  initialData?: Partial<TodoFormData>;
  onSubmit: (data: TodoFormData) => Promise<void>;
  onClose: () => void;
  isEdit?: boolean;
}

const defaultData: TodoFormData = {
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
};

export default function TodoForm({ initialData, onSubmit, onClose, isEdit }: TodoFormProps) {
  const [form, setForm] = useState<TodoFormData>({ ...defaultData, ...initialData });
  const [errors, setErrors] = useState<Partial<Record<keyof TodoFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TodoFormData, string>> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    else if (form.title.trim().length > 200) newErrors.title = "Title is too long (max 200 chars)";
    if (form.description.length > 1000) newErrors.description = "Description too long (max 1000 chars)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions: Array<{ value: TodoFormData["priority"]; label: string; color: string }> = [
    { value: "LOW", label: "Low", color: "var(--color-success)" },
    { value: "MEDIUM", label: "Medium", color: "var(--color-warning)" },
    { value: "HIGH", label: "High", color: "var(--color-danger)" },
  ];

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={isEdit ? "Edit task" : "New task"}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? "Edit task" : "New task"}</h2>
          <button
            id="close-form-btn"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className="form-group">
            <label htmlFor="todo-title" className="form-label">
              Task title <span className={styles.required}>*</span>
            </label>
            <input
              id="todo-title"
              type="text"
              className={`form-input ${errors.title ? "error" : ""}`}
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              autoFocus
              maxLength={200}
            />
            {errors.title && (
              <span className="form-error"><AlertCircle size={12} /> {errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="todo-desc" className="form-label">Description</label>
            <textarea
              id="todo-desc"
              className={`form-textarea ${errors.description ? "error" : ""}`}
              placeholder="Add more details (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              maxLength={1000}
            />
            <div className={styles.charCount}>{form.description.length}/1000</div>
            {errors.description && (
              <span className="form-error"><AlertCircle size={12} /> {errors.description}</span>
            )}
          </div>

          <div className={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">
                <Flag size={13} style={{ display: "inline", marginRight: 4 }} />
                Priority
              </label>
              <div className={styles.priorityGroup}>
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    id={`priority-${opt.value.toLowerCase()}`}
                    className={`${styles.priorityBtn} ${form.priority === opt.value ? styles.priorityBtnActive : ""}`}
                    style={form.priority === opt.value ? { borderColor: opt.color, color: opt.color, background: `${opt.color}18` } : {}}
                    onClick={() => setForm((f) => ({ ...f, priority: opt.value }))}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="todo-due" className="form-label">
                <Calendar size={13} style={{ display: "inline", marginRight: 4 }} />
                Due date
              </label>
              <input
                id="todo-due"
                type="date"
                className="form-input"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              id="cancel-form-btn"
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              id="submit-form-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><div className="spinner" /> {isEdit ? "Saving…" : "Creating…"}</>
              ) : (
                isEdit ? "Save changes" : "Create task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
