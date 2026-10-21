import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ErrorMessage, Field } from "../components/ui.jsx";
import api, { getApiErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, refresh } = useAuth();
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  // If the user already has a valid session, skip the login page entirely.
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="login">
      <form
        onSubmit={handleSubmit(async (values) => {
          try {
            setError(null);
            await api.post("/auth/login", values);
            // Refresh the AuthContext so user state is populated before navigating.
            await refresh();
            navigate("/");
          } catch (requestError) {
            setError({ message: getApiErrorMessage(requestError) });
          }
        })}
      >
        <p className="eyebrow">YASH EARTHING SOLUTIONS</p>
        <h1>Sales ERP</h1>
        <p className="muted">Sign in to your secure workspace.</p>
        {error && <ErrorMessage error={error} />}
        <Field label="Email">
          <input
            {...register("email", { required: true })}
            type="email"
            autoComplete="email"
          />
        </Field>
        <Field label="Password">
          <input
            {...register("password", { required: true, minLength: 8 })}
            type="password"
            autoComplete="current-password"
          />
        </Field>
        <button disabled={isSubmitting || loading} className="primary">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
