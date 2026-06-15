import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import { ThemeToggle } from "../../context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            TestPilot
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            AI-powered browser testing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}