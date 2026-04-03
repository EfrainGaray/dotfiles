import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register, ApiError } from "@/lib/api-client";
import { translations, type Locale, type TranslationKey } from "@/i18n/translations";

interface SignupFormProps {
  locale: Locale;
}

export function SignupForm({ locale }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const l = (key: TranslationKey) => translations[locale][key] || translations.en[key] || key;

  function validate(): string | null {
    if (password.length < 8) {
      return l("auth.minChars");
    }
    if (password !== confirmPassword) {
      return locale === "es" ? "Las contrasenas no coinciden" : "Passwords do not match";
    }
    if (!termsAccepted) {
      return locale === "es" ? "Debes aceptar los terminos" : "You must accept the terms";
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
      window.location.href = "/dashboard";
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { message?: string } | null;
        setError(body?.message || "Registration failed. Please try again.");
      } else {
        setError("Connection error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const termsPath = locale === "es" ? "/es/terms" : "/terms";
  const privacyPath = locale === "es" ? "/es/privacy" : "/privacy";

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          {l("auth.name")}
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder={l("auth.namePlaceholder")}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9"
          disabled={loading}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          {l("auth.email")}
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9"
          disabled={loading}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          {l("auth.password")}
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={l("auth.createPassword")}
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-9"
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">{l("auth.minChars")}</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
          {locale === "es" ? "Confirmar contrasena" : "Confirm password"}
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder={locale === "es" ? "Repite tu contrasena" : "Repeat your password"}
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-9"
          disabled={loading}
        />
      </div>

      <div className="flex items-start gap-2">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1 h-3.5 w-3.5 rounded border-input"
          disabled={loading}
        />
        <label htmlFor="terms" className="text-xs text-muted-foreground">
          {l("auth.terms")}{" "}
          <a href={termsPath} className="text-primary hover:underline">
            {l("auth.termsLink")}
          </a>{" "}
          {l("auth.and")}{" "}
          <a href={privacyPath} className="text-primary hover:underline">
            {l("auth.privacyLink")}
          </a>
        </label>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {l("auth.createBtn")}...
          </span>
        ) : (
          l("auth.createBtn")
        )}
      </Button>
    </form>
  );
}
