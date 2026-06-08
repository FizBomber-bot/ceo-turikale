import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { Loader2, ArrowUpRight } from "lucide-react";

export default function AdminLogin() {
  const { user, checked, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (checked && user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(formatApiError(err?.response?.data?.detail) || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main data-testid="admin-login-page" className="min-h-screen bg-[#fdfbf7] grid lg:grid-cols-12">
      <div className="hidden lg:block lg:col-span-5 bg-[#141517] text-[#fdfbf7] p-16 relative">
        <div className="font-serif text-3xl">
          Andry<span className="text-[#c9a08e]">.</span>Ridwan
        </div>
        <div className="absolute bottom-16 left-16 right-16">
          <p className="overline mb-6" style={{ color: "#c9a08e" }}>
            Admin Console
          </p>
          <h1 className="font-serif font-light text-5xl leading-[1.05]">
            The editor&rsquo;s
            <br />
            entrance.
          </h1>
          <p className="mt-6 text-sm text-[#fdfbf7]/65 leading-relaxed max-w-sm">
            Sign in to update your photo, CV, profile and case studies. Public
            site updates instantly.
          </p>
        </div>
      </div>

      <div className="lg:col-span-7 flex items-center justify-center p-8 md:p-16">
        <form
          data-testid="admin-login-form"
          onSubmit={submit}
          className="w-full max-w-md"
          noValidate
        >
          <p className="overline mb-6">Sign in</p>
          <h2 className="font-serif font-light text-4xl md:text-5xl leading-tight text-[#141517]">
            Welcome back<span className="text-[#7a2d2a]">.</span>
          </h2>
          <p className="mt-4 text-base text-[#5e5b55]">
            Use the admin credentials seeded from <code>backend/.env</code>.
          </p>

          <div className="mt-10 space-y-8">
            <div>
              <label className="text-[11px] tracking-[0.22em] uppercase text-[#5e5b55]">
                Email
              </label>
              <input
                data-testid="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="minimal-input mt-2 w-full bg-transparent border-0 border-b border-[#e5e1d8] py-3 text-base text-[#141517] focus:border-[#141517]"
              />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.22em] uppercase text-[#5e5b55]">
                Password
              </label>
              <input
                data-testid="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="minimal-input mt-2 w-full bg-transparent border-0 border-b border-[#e5e1d8] py-3 text-base text-[#141517] focus:border-[#141517]"
              />
            </div>
          </div>

          {error && (
            <p data-testid="login-error" className="mt-6 text-sm text-[#7a2d2a]">
              {error}
            </p>
          )}

          <button
            data-testid="login-submit"
            type="submit"
            disabled={busy}
            className="btn-primary mt-10 inline-flex items-center gap-3 px-7 py-4 text-xs tracking-[0.2em] uppercase disabled:opacity-60"
          >
            {busy ? (
              <>
                Signing in <Loader2 size={14} className="animate-spin" />
              </>
            ) : (
              <>
                Sign in <ArrowUpRight size={14} />
              </>
            )}
          </button>

          <a
            href="/"
            className="mt-10 block text-xs tracking-[0.18em] uppercase text-[#5e5b55] link-underline"
          >
            ← Back to portfolio
          </a>
        </form>
      </div>
    </main>
  );
}
