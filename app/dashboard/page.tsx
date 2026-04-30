"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, SlidersHorizontal, ClipboardList, CheckCircle2, CircleDot } from "lucide-react";
import TodoCard, { Todo } from "@/components/TodoCard/TodoCard";
import TodoForm, { TodoFormData } from "@/components/TodoForm/TodoForm";
import { ToastProvider, useToast } from "@/components/Toast/Toast";
import styles from "./page.module.css";

type Filter = "all" | "active" | "completed";
type SortField = "createdAt" | "dueDate" | "priority" | "title";
type Priority = "all" | "LOW" | "MEDIUM" | "HIGH";

interface Stats {
  total: number;
  completed: number;
  active: number;
}

function DashboardContent() {
  const { toast } = useToast();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, active: 0 });
  const [filter, setFilter] = useState<Filter>("all");
  const [priority, setPriority] = useState<Priority>("all");
  const [sort, setSort] = useState<SortField>("createdAt");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchTodos = useCallback(async () => {
    try {
      const params = new URLSearchParams({ filter, sort, order: "desc" });
      if (priority !== "all") params.set("priority", priority);
      const res = await fetch(`/api/todos?${params}`);
      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();
      setTodos(data.todos);
      setStats(data.stats);
    } catch {
      toast("Failed to load tasks. Please refresh.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [filter, priority, sort, toast]);

  useEffect(() => {
    setIsLoading(true);
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (data: TodoFormData) => {
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dueDate: data.dueDate || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create task");
      }
      toast("Task created!", "success");
      setShowForm(false);
      fetchTodos();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create task", "error");
    }
  };

  const handleEdit = async (data: TodoFormData) => {
    if (!editingTodo) return;
    try {
      const res = await fetch(`/api/todos/${editingTodo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dueDate: data.dueDate || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to update task");
      }
      toast("Task updated!", "success");
      setEditingTodo(null);
      fetchTodos();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update task", "error");
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    // Optimistic update
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed } : t));
    setStats((s) => ({
      ...s,
      completed: completed ? s.completed + 1 : s.completed - 1,
      active: completed ? s.active - 1 : s.active + 1,
    }));
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error();
      toast(completed ? "Task completed! 🎉" : "Task reopened", "success");
    } catch {
      // Revert optimistic update
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !completed } : t));
      setStats((s) => ({
        ...s,
        completed: completed ? s.completed - 1 : s.completed + 1,
        active: completed ? s.active + 1 : s.active - 1,
      }));
      toast("Failed to update task", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Task deleted", "info");
      fetchTodos();
    } catch {
      toast("Failed to delete task", "error");
    }
  };

  // Client-side search filter
  const filteredTodos = todos.filter((t) =>
    search.trim()
      ? t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="container">
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Tasks</h1>
          <p className={styles.pageSubtitle}>
            {stats.active > 0
              ? `${stats.active} task${stats.active !== 1 ? "s" : ""} remaining`
              : stats.total > 0
              ? "All tasks complete! 🎉"
              : "Start by adding your first task"}
          </p>
        </div>
        <button
          id="add-todo-btn"
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          New task
        </button>
      </div>

      {/* Stats Row */}
      {stats.total > 0 && (
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <ClipboardList size={18} className={styles.statIcon} />
            <div>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <CircleDot size={18} className={`${styles.statIcon} ${styles.statIconActive}`} />
            <div>
              <div className={styles.statValue}>{stats.active}</div>
              <div className={styles.statLabel}>Active</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <CheckCircle2 size={18} className={`${styles.statIcon} ${styles.statIconDone}`} />
            <div>
              <div className={styles.statValue}>{stats.completed}</div>
              <div className={styles.statLabel}>Done</div>
            </div>
          </div>
          <div className={styles.progressCard}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Progress</span>
              <span className={styles.progressPct}>{completionPct}%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            id="search-todos"
            type="search"
            className={`form-input ${styles.searchInput}`}
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterTabs}>
          {(["all", "active", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              id={`filter-${f}`}
              className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <button
          id="toggle-filters-btn"
          className={`btn btn-ghost btn-sm ${showFilters ? styles.filtersBtnActive : ""}`}
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal size={15} />
          Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className={styles.advancedFilters}>
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Priority</span>
            {(["all", "HIGH", "MEDIUM", "LOW"] as Priority[]).map((p) => (
              <button
                key={p}
                id={`priority-filter-${p.toLowerCase()}`}
                className={`${styles.filterChip} ${priority === p ? styles.filterChipActive : ""} ${
                  p !== "all" ? styles[`chip${p}`] : ""
                }`}
                onClick={() => setPriority(p)}
              >
                {p === "all" ? "All" : p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Sort by</span>
            {([
              { value: "createdAt", label: "Date created" },
              { value: "dueDate", label: "Due date" },
              { value: "priority", label: "Priority" },
              { value: "title", label: "Title" },
            ] as { value: SortField; label: string }[]).map((s) => (
              <button
                key={s.value}
                id={`sort-${s.value}`}
                className={`${styles.filterChip} ${sort === s.value ? styles.filterChipActive : ""}`}
                onClick={() => setSort(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Todo List */}
      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className="spinner spinner-lg" />
            <p>Loading your tasks…</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              {search ? <Search size={36} /> : <ClipboardList size={36} />}
            </div>
            <h3 className={styles.emptyTitle}>
              {search ? "No tasks match your search" : "No tasks here"}
            </h3>
            <p className={styles.emptyDesc}>
              {search
                ? `No results for "${search}". Try a different search.`
                : filter === "completed"
                ? "You haven't completed any tasks yet."
                : filter === "active"
                ? "No active tasks. Great job!"
                : "Create your first task to get started."}
            </p>
            {!search && filter === "all" && (
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
                id="empty-add-btn"
              >
                <Plus size={16} /> Add your first task
              </button>
            )}
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onEdit={(t) => setEditingTodo(t)}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <TodoForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}
      {editingTodo && (
        <TodoForm
          initialData={{
            title: editingTodo.title,
            description: editingTodo.description ?? "",
            priority: editingTodo.priority,
            dueDate: editingTodo.dueDate
              ? new Date(editingTodo.dueDate).toISOString().split("T")[0]
              : "",
          }}
          onSubmit={handleEdit}
          onClose={() => setEditingTodo(null)}
          isEdit
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
