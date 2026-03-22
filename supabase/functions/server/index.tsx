import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { initDefaultData } from "./init.tsx";
const app = new Hono();

// Initialize default data on startup
initDefaultData();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-db46e421/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all tasks
app.get("/make-server-db46e421/tasks", async (c) => {
  try {
    const tasks = await kv.getByPrefix("task:");
    return c.json({ tasks: tasks || [] });
  } catch (error) {
    console.log("Error fetching tasks:", error);
    return c.json({ error: "Failed to fetch tasks", details: String(error) }, 500);
  }
});

// Get task by ID
app.get("/make-server-db46e421/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const task = await kv.get(`task:${id}`);
    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }
    return c.json({ task });
  } catch (error) {
    console.log("Error fetching task:", error);
    return c.json({ error: "Failed to fetch task", details: String(error) }, 500);
  }
});

// Create task
app.post("/make-server-db46e421/tasks", async (c) => {
  try {
    const body = await c.req.json();
    const task = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`task:${task.id}`, task);
    return c.json({ task }, 201);
  } catch (error) {
    console.log("Error creating task:", error);
    return c.json({ error: "Failed to create task", details: String(error) }, 500);
  }
});

// Update task
app.put("/make-server-db46e421/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existingTask = await kv.get(`task:${id}`);
    if (!existingTask) {
      return c.json({ error: "Task not found" }, 404);
    }
    const updatedTask = {
      ...existingTask,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`task:${id}`, updatedTask);
    return c.json({ task: updatedTask });
  } catch (error) {
    console.log("Error updating task:", error);
    return c.json({ error: "Failed to update task", details: String(error) }, 500);
  }
});

// Delete task
app.delete("/make-server-db46e421/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`task:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting task:", error);
    return c.json({ error: "Failed to delete task", details: String(error) }, 500);
  }
});

// Get all categories
app.get("/make-server-db46e421/categories", async (c) => {
  try {
    const categories = await kv.getByPrefix("category:");
    return c.json({ categories: categories || [] });
  } catch (error) {
    console.log("Error fetching categories:", error);
    return c.json({ error: "Failed to fetch categories", details: String(error) }, 500);
  }
});

// Create category
app.post("/make-server-db46e421/categories", async (c) => {
  try {
    const body = await c.req.json();
    const category = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`category:${category.id}`, category);
    return c.json({ category }, 201);
  } catch (error) {
    console.log("Error creating category:", error);
    return c.json({ error: "Failed to create category", details: String(error) }, 500);
  }
});

// Delete category
app.delete("/make-server-db46e421/categories/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`category:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting category:", error);
    return c.json({ error: "Failed to delete category", details: String(error) }, 500);
  }
});

// Get user settings
app.get("/make-server-db46e421/settings", async (c) => {
  try {
    const settings = await kv.get("settings");
    return c.json({ settings: settings || {} });
  } catch (error) {
    console.log("Error fetching settings:", error);
    return c.json({ error: "Failed to fetch settings", details: String(error) }, 500);
  }
});

// Update user settings
app.put("/make-server-db46e421/settings", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("settings", body);
    return c.json({ settings: body });
  } catch (error) {
    console.log("Error updating settings:", error);
    return c.json({ error: "Failed to update settings", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);