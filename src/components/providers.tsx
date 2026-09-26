import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { getTelegram } from "@/lib/telegram";
import { registerServiceWorker } from "@/lib/register-sw";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  useEffect(() => {
    registerServiceWorker();
    const tg = getTelegram();
    if (!tg) return;
    tg.ready();
    tg.expand?.();
    const bg = tg.themeParams?.bg_color;
    if (bg) document.documentElement.style.setProperty("--color-bg", bg);
  }, []);

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "#121820",
            border: "1px solid rgba(34,197,94,0.25)",
            color: "#f0f4f8",
          },
        }}
      />
    </QueryClientProvider>
  );
}
