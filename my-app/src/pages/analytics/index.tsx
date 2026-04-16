import Head from "next/head";
import { useState } from "react";
import Header from "@/components/Header";
import ChartKelembapan from "@/components/analytics/chartKelembapan";
import ChartSuhu from "@/components/analytics/chartSuhu";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Analitik() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isOnline] = useState(true);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <Head>
        <title>Analitik - Smart Irrigation</title>
        <meta
          name="description"
          content="Analisis kelembapan tanah dan suhu bulanan"
        />
      </Head>

      <div className={theme}>
        <div
          className="min-h-screen transition-all duration-300"
          style={{ background: "var(--bg-900)" }}
        >
          <Header
            theme={theme}
            onToggleTheme={toggleTheme}
            isOnline={isOnline}
          />

          <main className="px-4 pb-8 pt-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/">
                <button
                  className="p-2 rounded-lg transition-all hover:scale-110"
                  style={{
                    background: "var(--bg-800)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <ArrowLeft
                    className="w-4 h-4"
                    style={{ color: "var(--primary)" }}
                  />
                </button>
              </Link>

              <h1 className="text-2xl font-bold">Analitik Bulanan</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartKelembapan />
              <ChartSuhu />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
