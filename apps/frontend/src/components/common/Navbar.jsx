import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            TestPilot
          </h1>
          <p className="text-sm text-slate-500">
            AI-powered browser testing
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
}