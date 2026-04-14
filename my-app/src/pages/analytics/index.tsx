import Head from "next/head";
import { useState } from "react";
import Header from "@/components/Header";
import ChartKelembapan from "@/components/analytics/chartKelembapan";
import ChartSuhu from "@/components/analytics/chartSuhu";

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
            <h1 className="text-2xl font-bold mb-4">Analitik Bulanan</h1>

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
