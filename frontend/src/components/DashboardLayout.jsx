import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";

export default function DashboardLayout() {
  const token = localStorage.getItem("token");

  // Jika tidak ada token, redirect ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#f1f5f9", // Slate 100
      width: "100%",
      position: "relative"
    }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: "280px", // Match new sidebar width
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "calc(100% - 280px)"
      }}>
        {/* Top Bar with Notification */}
        <div style={{
          padding: "16px 32px",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.6)",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
        }}>
          <NotificationBell />
        </div>

        {/* Content Area */}
        <div style={{
          padding: "32px 40px",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
          flex: 1
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
