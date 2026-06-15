import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser, saveToken, getToken } from "../services/authService";
import { ThemeToggle } from "../context/ThemeContext";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(form);
      console.log("LOGIN RESPONSE:", data);
      saveToken(data.access_token);
      console.log("TOKEN AFTER SAVE:", getToken());
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-950 px-4 py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm"
          style={{ padding: "2rem" }}
        >
          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
              style={{ marginBottom: "6px" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none transition-colors focus:border-stone-500 dark:focus:border-stone-400 focus:ring-2 focus:ring-stone-500/20 dark:focus:ring-stone-400/20"
              style={{ padding: "10px 12px", width: "100%", boxSizing: "border-box" }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: "6px" }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                Password
              </label>
              <a
                href="#"
                className="text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none transition-colors focus:border-stone-500 dark:focus:border-stone-400 focus:ring-2 focus:ring-stone-500/20 dark:focus:ring-stone-400/20"
              style={{ padding: "10px 12px", width: "100%", boxSizing: "border-box" }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-lg bg-stone-900 dark:bg-stone-100 text-sm font-semibold text-white dark:text-stone-900 transition-colors hover:bg-stone-800 dark:hover:bg-stone-200"
            style={{ padding: "10px 0" }}
          >
            Sign in
          </button>

          {/* Register link */}
          <p
            className="text-center text-sm text-stone-500 dark:text-stone-400"
            style={{ marginTop: "1.5rem" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-stone-900 dark:text-stone-100 hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
