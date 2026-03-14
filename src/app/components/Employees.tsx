import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  ratings: {
    punctuality: number;
    productivity: number;
    behavior: number;
  };
}

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    department: "",
    email: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-09864282/employees`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingEmployee(null);
    setFormData({ name: "", position: "", department: "", email: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      position: employee.position,
      department: employee.department,
      email: employee.email,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEmployee) {
        // Atualizar
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-09864282/employees/${editingEmployee.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...formData }),
          }
        );
        
        if (res.ok) {
          toast.success("Funcionário atualizado com sucesso!");
          fetchEmployees();
          setIsDialogOpen(false);
        }
      } else {
        // Criar
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-09864282/employees`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        
        if (res.ok) {
          toast.success("Funcionário criado com sucesso!");
          fetchEmployees();
          setIsDialogOpen(false);
        }
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("Erro ao salvar funcionário");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${name}?`)) return;
    
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09864282/employees/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      
      if (res.ok) {
        toast.success("Funcionário excluído com sucesso!");
        fetchEmployees();
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Erro ao excluir funcionário");
    }
  };

  const updateRating = async (employeeId: string, category: keyof Employee["ratings"], value: number) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return;

    const updatedRatings = { ...employee.ratings, [category]: value };

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09864282/employees/${employeeId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ratings: updatedRatings }),
        }
      );

      if (res.ok) {
        toast.success("Avaliação atualizada!");
        fetchEmployees();
      }
    } catch (error) {
      console.error("Error updating rating:", error);
      toast.error("Erro ao atualizar avaliação");
    }
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-gray-500 mt-2">Gerencie e avalie sua equipe</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Funcionário
        </Button>
      </div>

      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              Nenhum funcionário cadastrado. Clique em "Adicionar Funcionário" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {employees.map((employee) => {
            const avgRating = (employee.ratings.punctuality + employee.ratings.productivity + employee.ratings.behavior) / 3;
            
            return (
              <Card key={employee.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{employee.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{employee.position}</p>
                      {employee.department && (
                        <p className="text-sm text-gray-500 mt-1">
                          Departamento: {employee.department}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(employee)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(employee.id, employee.name)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Pontualidade
                      </Label>
                      <StarRating
                        value={employee.ratings.punctuality}
                        onChange={(val) => updateRating(employee.id, "punctuality", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Produtividade
                      </Label>
                      <StarRating
                        value={employee.ratings.productivity}
                        onChange={(val) => updateRating(employee.id, "productivity", val)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Comportamento
                      </Label>
                      <StarRating
                        value={employee.ratings.behavior}
                        onChange={(val) => updateRating(employee.id, "behavior", val)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {employee.email && (
                        <span>📧 {employee.email}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Média Geral:</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {avgRating.toFixed(1)}
                      </span>
                      <span className="text-gray-400">/5.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Editar Funcionário" : "Adicionar Funcionário"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="position">Cargo *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {editingEmployee ? "Salvar Alterações" : "Criar Funcionário"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
