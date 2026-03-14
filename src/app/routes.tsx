import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Dashboard } from "./components/Dashboard";
import { Employees } from "./components/Employees";
import { Absences } from "./components/Absences";
import { Reports } from "./components/Reports";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "employees", Component: Employees },
      { path: "absences", Component: Absences },
      { path: "reports", Component: Reports },
    ],
  },
]);
