export function clearSupabaseCookies() {
  if (typeof window === "undefined") {
    console.warn("clearSupabaseCookies can only be called in the browser");
    return;
  }

  const supabaseProjectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
    /\/\/([^.]+)\./
  )?.[1];

  if (!supabaseProjectId) {
    console.warn("Could not determine Supabase project ID from URL");
    return;
  }

  const cookiePrefix = `sb-${supabaseProjectId}-auth-token`;
  const cookieNames = [
    `${cookiePrefix}.0`,
    `${cookiePrefix}.1`,
    `${cookiePrefix}.2`,
  ];

  const domains = [
    "",
    ".winlab.tw",
    "portal.winlab.tw",
    "approve.winlab.tw",
    "bento.winlab.tw",
    "reimburse.winlab.tw",
  ];

  cookieNames.forEach((name) => {
    domains.forEach((domain) => {
      const domainPart = domain ? ` domain=${domain};` : "";
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${domainPart}`;
    });
  });
}
