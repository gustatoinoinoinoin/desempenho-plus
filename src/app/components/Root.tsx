import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, Users, CalendarX, BarChart3 } from "lucide-react";

export function Root() {
  const location = useLocation();
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Funcionários", href: "/employees", icon: Users },
    { name: "Faltas", href: "/absences", icon: CalendarX },
    { name: "Relatórios", href: "/reports", icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-indigo-600 to-indigo-800 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Desempenho+</h1>
          <p className="text-indigo-200 text-sm mt-1">Gestão de RH</p>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-md"
                    : "text-indigo-100 hover:bg-indigo-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-indigo-500">
          <p className="text-xs text-indigo-200 text-center">
            © 2024 Desempenho+
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
