import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

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
app.get("/make-server-09864282/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== FUNCIONÁRIOS ====================

// Listar todos os funcionários
app.get("/make-server-09864282/employees", async (c) => {
  try {
    const employees = await kv.getByPrefix("employee:");
    return c.json({ employees: employees || [] });
  } catch (error) {
    console.log("Error fetching employees:", error);
    return c.json({ error: "Failed to fetch employees", details: String(error) }, 500);
  }
});

// Criar funcionário
app.post("/make-server-09864282/employees", async (c) => {
  try {
    const body = await c.req.json();
    const { name, position, department, email } = body;
    
    if (!name || !position) {
      return c.json({ error: "Name and position are required" }, 400);
    }
    
    const id = `employee:${Date.now()}`;
    const employee = {
      id,
      name,
      position,
      department: department || "",
      email: email || "",
      ratings: {
        punctuality: 0,
        productivity: 0,
        behavior: 0
      },
      createdAt: new Date().toISOString()
    };
    
    await kv.set(id, employee);
    return c.json({ employee });
  } catch (error) {
    console.log("Error creating employee:", error);
    return c.json({ error: "Failed to create employee", details: String(error) }, 500);
  }
});

// Atualizar funcionário
app.put("/make-server-09864282/employees/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: "Employee not found" }, 404);
    }
    
    const updated = { ...existing, ...body, id };
    await kv.set(id, updated);
    return c.json({ employee: updated });
  } catch (error) {
    console.log("Error updating employee:", error);
    return c.json({ error: "Failed to update employee", details: String(error) }, 500);
  }
});

// Deletar funcionário
app.delete("/make-server-09864282/employees/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting employee:", error);
    return c.json({ error: "Failed to delete employee", details: String(error) }, 500);
  }
});

// ==================== FALTAS ====================

// Listar todas as faltas
app.get("/make-server-09864282/absences", async (c) => {
  try {
    const absences = await kv.getByPrefix("absence:");
    return c.json({ absences: absences || [] });
  } catch (error) {
    console.log("Error fetching absences:", error);
    return c.json({ error: "Failed to fetch absences", details: String(error) }, 500);
  }
});

// Criar falta
app.post("/make-server-09864282/absences", async (c) => {
  try {
    const body = await c.req.json();
    const { employeeId, employeeName, date, reason, justified } = body;
    
    if (!employeeId || !date) {
      return c.json({ error: "Employee ID and date are required" }, 400);
    }
    
    const id = `absence:${Date.now()}`;
    const absence = {
      id,
      employeeId,
      employeeName,
      date,
      reason: reason || "",
      justified: justified || false,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(id, absence);
    return c.json({ absence });
  } catch (error) {
    console.log("Error creating absence:", error);
    return c.json({ error: "Failed to create absence", details: String(error) }, 500);
  }
});

// Atualizar falta
app.put("/make-server-09864282/absences/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: "Absence not found" }, 404);
    }
    
    const updated = { ...existing, ...body, id };
    await kv.set(id, updated);
    return c.json({ absence: updated });
  } catch (error) {
    console.log("Error updating absence:", error);
    return c.json({ error: "Failed to update absence", details: String(error) }, 500);
  }
});

// Deletar falta
app.delete("/make-server-09864282/absences/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting absence:", error);
    return c.json({ error: "Failed to delete absence", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);