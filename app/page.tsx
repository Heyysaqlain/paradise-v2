"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/lib/client";

type AuthMode = "login" | "register";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
  });

  function updateField(field: string, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    if (mode === "register" && !form.fullName.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setMessage("Email address is required.");
      return;
    }

    if (!form.mobile.trim()) {
      setMessage("Mobile number is required.");
      return;
    }

    if (form.mobile.length !== 10) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.fullName,
              mobile: form.mobile,
            },
          },
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        if (data.session) {
          router.push("/experience");
          router.refresh();
          return;
        }

        setMessage(
          "Registration successful. Please check your email to confirm your account."
        );

        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/experience");
      router.refresh();
    } catch (error) {
      console.error("Authentication error:", error);

      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Google login error:", error);

      setMessage("Could not continue with Google.");
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="visual-overlay" />

        <div className="brand">
          <div className="brand-icon">P</div>

          <div>
            <h2>PARADISE</h2>
            <span>COLLECTION</span>
          </div>
        </div>

        <div className="visual-content">
          <p className="eyebrow">WELCOME TO PARADISE</p>

          <h1>
            Elegance,
            <br />
            Curated For You.
          </h1>

          <p className="visual-description">
            Step into a world of timeless fashion, premium collections and a
            personalised shopping experience created especially for you.
          </p>

          <div className="feature-row">
            <div>
              <strong>Premium</strong>
              <span>Collections</span>
            </div>

            <div>
              <strong>Personal</strong>
              <span>AI Assistant</span>
            </div>

            <div>
              <strong>Secure</strong>
              <span>Shopping</span>
            </div>
          </div>
        </div>

        <div className="visual-footer">
          © 2026 Paradise Collection
        </div>
      </section>

      <section className="auth-section">
        <div className="mobile-brand">
          <div className="brand-icon">P</div>

          <div>
            <h2>PARADISE</h2>
            <span>COLLECTION</span>
          </div>
        </div>

        <div className="auth-container">
          <p className="small-heading">
            {mode === "login" ? "WELCOME BACK" : "JOIN PARADISE"}
          </p>

          <h2>
            {mode === "login"
              ? "Enter your Paradise"
              : "Create your account"}
          </h2>

          <p className="auth-subtitle">
            {mode === "login"
              ? "Sign in to continue your personalised shopping experience."
              : "Register to discover fashion selected especially for you."}
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "active-tab" : ""}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Login
            </button>

            <button
              type="button"
              className={mode === "register" ? "active-tab" : ""}
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="input-group">
                <label htmlFor="fullName">Full Name</label>

                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  disabled={loading}
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="mobile">Mobile Number</label>

              <div className="mobile-input">
                <span>+91</span>

                <input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  value={form.mobile}
                  onChange={(event) => {
                    const numbersOnly = event.target.value.replace(/\D/g, "");

                    updateField("mobile", numbersOnly);
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-group">
              <div className="password-label">
                <label htmlFor="password">Password</label>

                {mode === "login" && (
                  <button
                    type="button"
                    className="forgot-button"
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <label className="remember-row">
                <input type="checkbox" disabled={loading} />
                <span>Remember me on this device</span>
              </label>
            )}

            {message && <div className="form-message">{message}</div>}

            <button
              className="submit-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Enter Paradise"
                : "Create Paradise Account"}

              {!loading && <span>→</span>}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              margin: "22px 0",
            }}
          >
            <div
              style={{
                height: "1px",
                background: "#e5d7d7",
                flex: 1,
              }}
            />

            <span
              style={{
                fontSize: "12px",
                color: "#8b7474",
              }}
            >
              OR
            </span>

            <div
              style={{
                height: "1px",
                background: "#e5d7d7",
                flex: 1,
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%",
              height: "58px",
              background: "#ffffff",
              border: "1px solid #d9cccc",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px",
              fontWeight: 600,
              color: "#32121c",
            }}
          >
            {loading ? "Please wait..." : "Continue with Google"}
          </button>

          <div className="secure-message">
            <span>◇</span>

            <p>
              Your information is protected with secure authentication.
            </p>
          </div>

          <p className="terms">
            By continuing, you agree to Paradise Collection&apos;s Terms of
            Service and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}