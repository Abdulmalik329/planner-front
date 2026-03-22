import { createBrowserRouter, Navigate } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Calendar } from "./pages/Calendar";
import { Tasks } from "./pages/Tasks";
import { Statistics } from "./pages/Statistics";
import { Categories } from "./pages/Categories";
import { Archive } from "./pages/Archive";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "calendar", Component: Calendar },
      { path: "tasks", Component: Tasks },
      { path: "statistics", Component: Statistics },
      { path: "categories", Component: Categories },
      { path: "archive", Component: Archive },
      { path: "settings", Component: Settings },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
