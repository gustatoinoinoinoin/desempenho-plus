import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { Star, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  ratings: {
    punctuality: number;
    productivity: number;
    behavior: number;
  };
}

interface Absence {
  id: string;
  employeeId: string;
  date: string;
  justified: boolean;
}

export function Reports() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    fetchData();
    // Define o mês atual
    const now = new Date();
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
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
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gera opções de meses (últimos 12 meses)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = format(date, "MMMM 'de' yyyy", { locale: ptBR });
      options.push({ value, label });
    }
    
    return options;
  };

  // Filtrar faltas do mês selecionado
  const getAbsencesForMonth = (employeeId: string) => {
    if (!selectedMonth) return [];
    
    const [year, month] = selectedMonth.split("-").map(Number);
    
    return absences.filter((abs) => {
      const absDate = new Date(abs.date);
      return (
        abs.employeeId === employeeId &&
        absDate.getFullYear() === year &&
        absDate.getMonth() + 1 === month
      );
    });
  };

  // Calcular média geral do mês
  const calculateMonthAverage = () => {
    if (employees.length === 0) return 0;
    
    const sum = employees.reduce((total, emp) => {
      return total + (emp.ratings.punctuality + emp.ratings.productivity + emp.ratings.behavior) / 3;
    }, 0);
    
    return sum / employees.length;
  };

  const StarDisplay = ({ value }: { value: number }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const monthOptions = generateMonthOptions();
  const monthAverage = calculateMonthAverage();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios de Desempenho</h1>
        <p className="text-gray-500 mt-2">Análise detalhada do desempenho por período</p>
      </div>

      {/* Seletor de Mês */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Selecione o período
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue placeholder="Selecione um mês" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Média Geral do Mês */}
      <Card className="mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            Média Geral de Desempenho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold">{monthAverage.toFixed(1)}</span>
            <span className="text-2xl text-indigo-100 mb-2">/5.0</span>
          </div>
          <p className="text-indigo-100 mt-2">
            Baseado em {employees.length} funcionário{employees.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      {/* Tabela de Avaliações */}
      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              Nenhum funcionário cadastrado para exibir relatórios.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Avaliações Detalhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-gray-700">Funcionário</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Cargo</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Pontualidade</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Produtividade</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Comportamento</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Média</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Faltas</th>
                  </tr>
                </thead>
                <tbody>
                  {employees
                    .sort((a, b) => {
                      const avgA = (a.ratings.punctuality + a.ratings.productivity + a.ratings.behavior) / 3;
                      const avgB = (b.ratings.punctuality + b.ratings.productivity + b.ratings.behavior) / 3;
                      return avgB - avgA;
                    })
                    .map((employee) => {
                      const avg = (employee.ratings.punctuality + employee.ratings.productivity + employee.ratings.behavior) / 3;
                      const employeeAbsences = getAbsencesForMonth(employee.id);
                      
                      return (
                        <tr key={employee.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-gray-900">{employee.name}</p>
                              {employee.department && (
                                <p className="text-sm text-gray-500">{employee.department}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-gray-700">{employee.position}</td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <StarDisplay value={employee.ratings.punctuality} />
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <StarDisplay value={employee.ratings.productivity} />
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <StarDisplay value={employee.ratings.behavior} />
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center gap-1">
                              <span className={`text-lg font-bold ${
                                avg >= 4.5 ? "text-green-600" :
                                avg >= 3.5 ? "text-blue-600" :
                                avg >= 2.5 ? "text-yellow-600" :
                                "text-red-600"
                              }`}>
                                {avg.toFixed(1)}
                              </span>
                              <span className="text-sm text-gray-400">/5</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                              employeeAbsences.length === 0
                                ? "bg-green-100 text-green-700"
                                : employeeAbsences.length <= 2
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {employeeAbsences.length}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legenda */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Classificação por Desempenho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-sm text-gray-700">Excelente: 4.5 - 5.0</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-sm text-gray-700">Bom: 3.5 - 4.4</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <span className="text-sm text-gray-700">Regular: 2.5 - 3.4</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span className="text-sm text-gray-700">Necessita Melhoria: 0 - 2.4</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Indicadores de Faltas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-green-700">0</span>
              </div>
              <span className="text-sm text-gray-700">Sem faltas no período</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-yellow-700">1-2</span>
              </div>
              <span className="text-sm text-gray-700">Aceitável</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-red-700">3+</span>
              </div>
              <span className="text-sm text-gray-700">Atenção necessária</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
