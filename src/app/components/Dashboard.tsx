import { useEffect, useState } from "react";
import { Users, CalendarX, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Employee {
  id: string;
  name: string;
  position: string;
  ratings: {
    punctuality: number;
    productivity: number;
    behavior: number;
  };
}

interface Absence {
  id: string;
  date: string;
}

export function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, absRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-09864282/employees`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-09864282/absences`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }),
      ]);

      const empData = await empRes.json();
      const absData = await absRes.json();

      setEmployees(empData.employees || []);
      setAbsences(absData.absences || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const totalEmployees = employees.length;
  
  // Faltas deste mês
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const absencesThisMonth = absences.filter((absence) => {
    const absenceDate = new Date(absence.date);
    return absenceDate.getMonth() === currentMonth && absenceDate.getFullYear() === currentYear;
  }).length;

  // Média geral de desempenho
  const averagePerformance = employees.length > 0
    ? employees.reduce((sum, emp) => {
        const avg = (emp.ratings.punctuality + emp.ratings.productivity + emp.ratings.behavior) / 3;
        return sum + avg;
      }, 0) / employees.length
    : 0;

  const stats = [
    {
      title: "Total de Funcionários",
      value: totalEmployees,
      icon: Users,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Faltas no Mês",
      value: absencesThisMonth,
      icon: CalendarX,
      color: "bg-red-500",
      bgLight: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      title: "Desempenho Médio",
      value: averagePerformance.toFixed(1),
      icon: TrendingUp,
      color: "bg-green-500",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
      suffix: "/5",
    },
    {
      title: "Taxa de Excelência",
      value: employees.length > 0
        ? Math.round((employees.filter(e => {
            const avg = (e.ratings.punctuality + e.ratings.productivity + e.ratings.behavior) / 3;
            return avg >= 4.5;
          }).length / employees.length) * 100)
        : 0,
      icon: Award,
      color: "bg-purple-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
      suffix: "%",
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Visão geral do desempenho da equipe</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgLight}`}>
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                    <p className={`text-3xl font-bold mt-1 ${stat.textColor}`}>
                      {stat.value}
                      {stat.suffix && <span className="text-xl">{stat.suffix}</span>}
                    </p>
                  </div>
                </div>
                <div className={`h-1 ${stat.color}`}></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Melhores Desempenhos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum funcionário cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {employees
                .map((emp) => ({
                  ...emp,
                  avgRating: (emp.ratings.punctuality + emp.ratings.productivity + emp.ratings.behavior) / 3,
                }))
                .sort((a, b) => b.avgRating - a.avgRating)
                .slice(0, 5)
                .map((emp, index) => (
                  <div key={emp.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? "bg-yellow-500 text-white" :
                      index === 1 ? "bg-gray-300 text-gray-700" :
                      index === 2 ? "bg-orange-400 text-white" :
                      "bg-gray-200 text-gray-600"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{emp.name}</p>
                      <p className="text-sm text-gray-500">{emp.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">{emp.avgRating.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">de 5.0</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
