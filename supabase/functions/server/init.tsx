import * as kv from "./kv_store.tsx";

export async function initDefaultData() {
  try {
    // Check if data already exists
    const existingTasks = await kv.getByPrefix("task:");
    if (existingTasks && existingTasks.length > 0) {
      console.log("Data already initialized");
      return;
    }

    // Default categories
    const categories = [
      { id: "cat-1", name: "Ish", emoji: "💼", color: "bg-blue-500" },
      { id: "cat-2", name: "Shaxsiy", emoji: "👤", color: "bg-purple-500" },
      { id: "cat-3", name: "Sport", emoji: "💪", color: "bg-green-500" },
      { id: "cat-4", name: "Oila", emoji: "🏠", color: "bg-pink-500" },
      { id: "cat-5", name: "O'qish", emoji: "📚", color: "bg-yellow-500" },
      { id: "cat-6", name: "Sog'liq", emoji: "❤️", color: "bg-red-500" },
    ];

    // Save categories
    for (const category of categories) {
      await kv.set(`category:${category.id}`, category);
    }

    // Default tasks
    const tasks = [
      {
        id: "task-1",
        title: "Sport mashg'ulotlari",
        description: "Ertalab sport zali",
        category: "💪 Sport",
        priority: "high",
        date: new Date().toISOString(),
        type: "daily",
        completed: false,
      },
      {
        id: "task-2",
        title: "Loyiha ustida ishlash",
        description: "Frontend development",
        category: "💼 Ish",
        priority: "high",
        date: new Date().toISOString(),
        type: "daily",
        completed: false,
      },
      {
        id: "task-3",
        title: "Kitob o'qish",
        description: "30 sahifa",
        category: "📚 O'qish",
        priority: "medium",
        date: new Date().toISOString(),
        type: "daily",
        completed: false,
      },
      {
        id: "task-4",
        title: "Haftalik reja tuzish",
        description: "Keyingi hafta rejasi",
        category: "👤 Shaxsiy",
        priority: "medium",
        date: new Date().toISOString(),
        type: "weekly",
        completed: false,
      },
    ];

    // Save tasks
    for (const task of tasks) {
      await kv.set(`task:${task.id}`, task);
    }

    console.log("Default data initialized successfully");
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}
