import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { VT } from "../../utils/mockData";

export default function TopBar() {
  const { view, category, search, setSearch, openAdd, dayLabel, showSearch } = useApp();
  const title = category ? `Categoría: ${category}` : VT[view] || "Dashboard";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(response => {
        if (response.status === 'success') {
          setNotifications(response.data);
          setUnreadCount(response.data.filter(n => !n.isRead).length);
        }
      })
      .catch(err => console.error("Error API:", err));
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
      }
    } catch (error) {
      console.error(error);
    }
  };
  // ... dentro de tu componente TopBar ...
  const handleTestRegister = async () => {
    const mockToken = "token_prueba_" + Math.random().toString(36).substr(2, 9);
    
    try {
      const response = await fetch('/api/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: mockToken, type: 'test_browser' })
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        alert("¡Éxito! Token registrado en PostgreSQL: " + mockToken);
      }
    } catch (err) {
      alert("Error en el registro: " + err.message);
    }
  };

// ... luego en tu JSX, agrega el botón:
<button onClick={handleTestRegister} style={{ padding: "8px", fontSize: "10px", background: "var(--color-background-info)", borderRadius: "4px" }}>
  Test Registro
</button>

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
      <div>
        <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "6px", letterSpacing: "-0.5px" }}>
          {title}
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)", fontWeight: 500 }}>
          {dayLabel}
        </div>
      </div>

      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
        {showSearch && (
          <div style={{ position: "relative" }}>
            <i className="ti ti-search" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "var(--color-text-tertiary)" }}></i>
            <input className="search-input" placeholder="Buscar tareas..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        )}

        <div style={{ position: "relative" }}>
          <button
            style={{ background: "transparent", border: "none", cursor: "pointer", position: "relative", padding: "8px", color: "var(--color-text-tertiary)" }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <i className="ti ti-bell" style={{ fontSize: "20px" }}></i>
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: "2px", right: "2px", background: "#e74c3c", color: "white", borderRadius: "50%", fontSize: "10px", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div style={{ position: "absolute", right: 0, top: "45px", background: "#ffffff", border: "1px solid #eaeaea", borderRadius: "8px", width: "300px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", zIndex: 9999, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #eaeaea", fontWeight: 600, fontSize: "14px", backgroundColor: "#f8f9fa", color: "#333333" }}>
                Notificaciones
              </div>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "16px", textAlign: "center", fontSize: "13px", color: "#666666" }}>No hay notificaciones</div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                      style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid #eaeaea",
                        fontSize: "13px",
                        cursor: notif.isRead ? "default" : "pointer",
                        backgroundColor: notif.isRead ? "#ffffff" : "#ebf5ff",
                        color: notif.isRead ? "#6b7280" : "#111827",
                        transition: "background 0.2s",
                        fontWeight: notif.isRead ? 400 : 500
                      }}
                    >
                      {notif.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button className="btn-primary" onClick={openAdd}>
          <i className="ti ti-plus" style={{ fontSize: "16px" }}></i>
          Nueva tarea
        </button>
      </div>
    </div>
  );
}