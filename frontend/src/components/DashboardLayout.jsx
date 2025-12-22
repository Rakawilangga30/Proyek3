import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

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
      background: "#f8fafc"
    }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: "260px",
        padding: "32px",
        minHeight: "100vh"
      }}>
        {/* Content Area */}
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
