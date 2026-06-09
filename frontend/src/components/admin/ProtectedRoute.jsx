import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, checked } = useAuth();
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1ece9] text-[#5b6e72]">
        <span className="text-xs tracking-[0.22em] uppercase">Checking session…</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}
