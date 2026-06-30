"use client";

import { BrandLogo } from "@/components/brand/brand-logo";
import { PoweredBy } from "@/components/brand/powered-by";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/lib/api-client";
import type { AdminAuthUser } from "@/modules/auth/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AlertCircle, ChevronLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await apiPost<{ user: AdminAuthUser; expiresIn: number }>(
      "/api/auth/admin/login",
      { email, password },
    );

    setLoading(false);

    if (result.error || !result.data) {
      setError(result.error ?? result.message ?? "Login failed");
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <BrandLogo size="md" />
          </div>
          <h2 className="m-0 mb-1.5 text-2xl font-extrabold text-exam-text">
            Admin Access
          </h2>
          <p className="m-0 text-sm text-exam-muted">
            Restricted to authorised administrators
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-exam-border bg-exam-white p-7 shadow-sm"
        >
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@examlink.local"
            autoComplete="username"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoComplete="current-password"
            required
          />
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-[13px] text-exam-red">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <Button
            type="submit"
            variant="navy"
            className="mt-1 w-full justify-center"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <Link
          href="/"
          className="mx-auto mt-5 flex w-fit items-center gap-1.5 text-[13px] text-exam-muted hover:text-exam-text"
        >
          <ChevronLeft size={14} /> Back to home
        </Link>

        <PoweredBy className="mt-8" />
      </div>
    </div>
  );
}
