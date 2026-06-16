import React from "react";
import { useApp } from "../../context/AppContext";
import TaskCard from "../../components/ui/TaskCard";

export default function TasksView() {
  const { filtered } = useApp(); // Ahora consume las tareas ya filtradas del Contexto

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
      {filtered.length === 0 ? (
        <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
          No hay tareas.
        </div>
      ) : (
        filtered.map(task => <TaskCard key={task.id} task={task} />)
      )}
    </div>
  );
}