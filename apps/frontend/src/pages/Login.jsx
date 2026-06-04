import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser, saveToken , getToken } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });


  console.log(import.meta.env);
  
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
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <h1 className="mb-6 text-2xl font-semibold">
          Login
        </h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="mb-4 w-full rounded-md border border-stone-300 px-3 py-2"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="mb-4 w-full rounded-md border border-stone-300 px-3 py-2"
        />

        <button
          type="submit"
          className="w-full rounded-md bg-stone-900 py-2 text-white"
        >
          Login
        </button>

        <p className="mt-4 text-sm">
          No account?{" "}
          <Link to="/register" className="underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}