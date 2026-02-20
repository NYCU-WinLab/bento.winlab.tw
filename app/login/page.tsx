"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [loading, setLoading] = useState<"keycloak" | "google" | null>(null);

  const supabase = createClient();

  const handleLogin = useCallback(
    async (provider: "google" | "keycloak") => {
      setLoading(provider);
      try {
        const origin = window.location.origin;
        const redirectTo =
          `${origin}/api/auth/callback` +
          (next && next !== "/" ? `?next=${encodeURIComponent(next)}` : "");

        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
            scopes: provider === "keycloak" ? "openid" : undefined,
          },
        });
      } catch (error) {
        console.error("Login error:", error);
        setLoading(null);
      }
    },
    [next]
  );

  return (
    <div className="flex min-h-[calc(100dvh-(--spacing(4))-8rem)] flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm border-border/80 bg-card/95 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl font-semibold tracking-tight">
            登入
          </CardTitle>
          <CardDescription>
            當 Keycloak 無法使用時，可以使用 Google 登入
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            type="button"
            variant="default"
            className="w-full"
            disabled={loading !== null}
            onClick={() => handleLogin("keycloak")}
          >
            {loading === "keycloak" ? "導向 Keycloak…" : "使用 Keycloak 登入"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading !== null}
            onClick={() => handleLogin("google")}
          >
            {loading === "google" ? "導向 Google…" : "使用 Google 登入"}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Link href="/" className="underline underline-offset-2 hover:text-foreground">
              返回首頁
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
