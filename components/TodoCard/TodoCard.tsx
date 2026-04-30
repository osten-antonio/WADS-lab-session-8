"use client";

import { useState } from "react";
import { Pencil, Trash2, Calendar, Check } from "lucide-react";
import styles from "./TodoCard.module.css";

export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
  createdAt: string;
}

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => Promise<void>;
}

const priorityLabels: Record<Todo["priority"], string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.setHours(0, 0, 0, 0);
  const days = Math.ceil(diff / 86400000);

  if (days < 0) return `Overdue by ${Math.abs(days)}d`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days <= 7) return `Due in ${days}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));
}

export default function TodoCard({ todo, onToggle, onEdit, onDelete }: TodoCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(todo.id, !todo.completed);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(todo.id);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const overdue = todo.dueDate && !todo.completed && isOverdue(todo.dueDate);

  return (
    <div
      className={`${styles.card} ${todo.completed ? styles.cardCompleted : ""} animate-fade-in`}
      id={`todo-${todo.id}`}
    >
      {/* Checkbox */}
      <button
        className={`${styles.checkbox} ${todo.completed ? styles.checkboxDone : ""} ${isToggling ? styles.toggling : ""}`}
        onClick={handleToggle}
        disabled={isToggling}
        aria-label={todo.completed ? "Mark as active" : "Mark as completed"}
        id={`toggle-${todo.id}`}
      >
        {todo.completed && <Check size={12} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={`${styles.title} ${todo.completed ? styles.titleDone : ""}`}>
            {todo.title}
          </span>
          <span className={`badge badge-${todo.priority.toLowerCase()}`}>
            {priorityLabels[todo.priority]}
          </span>
        </div>

        {todo.description && (
          <p className={styles.description}>{todo.description}</p>
        )}

        {todo.dueDate && (
          <div className={`${styles.dueDate} ${overdue ? styles.dueDateOverdue : ""}`}>
            <Calendar size={12} />
            <span>{formatDate(todo.dueDate)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => onEdit(todo)}
          title="Edit task"
          id={`edit-${todo.id}`}
          aria-label="Edit task"
        >
          <Pencil size={15} />
        </button>
        <button
          className={`btn btn-icon ${showConfirm ? "btn-danger" : "btn-ghost"}`}
          onClick={handleDelete}
          disabled={isDeleting}
          title={showConfirm ? "Click again to confirm delete" : "Delete task"}
          id={`delete-${todo.id}`}
          aria-label={showConfirm ? "Confirm delete" : "Delete task"}
        >
          {isDeleting ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={15} />}
        </button>
      </div>
    </div>
  );
}
