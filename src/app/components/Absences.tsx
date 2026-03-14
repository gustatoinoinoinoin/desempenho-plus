import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Employee {
  id: string;
  name: string;
  position: string;
}

interface Absence {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  reason: string;
  justified: boolean;
}

export function Absences() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    reason: "",
    justified: false,
  });

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
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingAbsence(null);
    setFormData({
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      reason: "",
      justified: false,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (absence: Absence) => {
    setEditingAbsence(absence);
    setFormData({
      employeeId: absence.employeeId,
      date: absence.date,
      reason: absence.reason,
      justified: absence.justified,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const employee = employees.find((e) => e.id === formData.employeeId);
    if (!employee && !editingAbsence) {
      toast.error("Selecione um funcionário");
      return;
    }

    try {
      if (editingAbsence) {
        // Atualizar
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-09864282/absences/${editingAbsence.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (res.ok) {
          toast.success("Falta atualizada com sucesso!");
          fetchData();
          setIsDialogOpen(false);
        }
      } else {
        // Criar
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-09864282/absences`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            employeeName: employee?.name,
          }),
        });

        if (res.ok) {
          toast.success("Falta registrada com sucesso!");
          fetchData();
          setIsDialogOpen(false);
        }
      }
    } catch (error) {
      console.error("Error saving absence:", error);
      toast.error("Erro ao salvar falta");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09864282/absences/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (res.ok) {
        toast.success("Registro excluído com sucesso!");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting absence:", error);
      toast.error("Erro ao excluir registro");
    }
  };

  // Ordenar por data (mais recente primeiro)
  const sortedAbsences = [...absences].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faltas</h1>
          <p className="text-gray-500 mt-2">Registre e gerencie as ausências dos funcionários</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Registrar Falta
        </Button>
      </div>

      {sortedAbsences.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              Nenhuma falta registrada. Clique em "Registrar Falta" para adicionar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedAbsences.map((absence) => (
            <Card key={absence.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        absence.justified ? "bg-green-100" : "bg-red-100"
                      }`}>
                        {absence.justified ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {absence.employeeName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(absence.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    <div className="ml-14">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          absence.justified
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {absence.justified ? "Justificada" : "Não Justificada"}
                        </span>
                      </div>

                      {absence.reason && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 font-medium mb-1">Motivo:</p>
                          <p className="text-sm text-gray-700">{absence.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(absence)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(absence.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAbsence ? "Editar Falta" : "Registrar Falta"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="employee">Funcionário *</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                  disabled={!!editingAbsence}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} - {emp.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="reason">Motivo</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Descreva o motivo da falta..."
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="justified"
                  checked={formData.justified}
                  onChange={(e) => setFormData({ ...formData, justified: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <Label htmlFor="justified" className="cursor-pointer">
                  Falta justificada
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {editingAbsence ? "Salvar Alterações" : "Registrar Falta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
