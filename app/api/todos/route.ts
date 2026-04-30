import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") ?? "all";
    const priority = searchParams.get("priority");
    const sort = searchParams.get("sort") ?? "createdAt";
    const order = searchParams.get("order") ?? "desc";

    const where: Record<string, unknown> = { userId: session.user.id };

    if (filter === "active") where.completed = false;
    if (filter === "completed") where.completed = true;
    if (priority && ["LOW", "MEDIUM", "HIGH"].includes(priority)) {
      where.priority = priority;
    }

    const validSortFields = ["createdAt", "updatedAt", "dueDate", "title", "priority"];
    const sortField = validSortFields.includes(sort) ? sort : "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const todos = await prisma.todo.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
    });

    const total = await prisma.todo.count({ where: { userId: session.user.id } });
    const completed = await prisma.todo.count({
      where: { userId: session.user.id, completed: true },
    });

    return NextResponse.json({ todos, stats: { total, completed, active: total - completed } });
  } catch (error) {
    console.error("GET /api/todos error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createTodoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, priority, dueDate } = parsed.data;

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    console.error("POST /api/todos error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
