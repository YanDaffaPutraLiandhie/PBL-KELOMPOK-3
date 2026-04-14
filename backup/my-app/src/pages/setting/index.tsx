import Head from "next/head";
import Link from "next/link";

export default function Setting() {
  return (
    <>
      <Head>
        <title>Pengaturan - Smart Irrigation System</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--bg-900)", color: "var(--text-primary)" }}>
        <h1 className="text-3xl font-bold glow-text mb-4">Pengaturan</h1>
        <p style={{ color: "var(--text-muted)" }}>Konfigurasi sistem dan notifikasi irigasi.</p>
        <Link href="/" className="mt-6 btn-quick" style={{ color: "var(--primary)", borderColor: "var(--primary)" }}>
          ← Kembali ke Dashboard
        </Link>
      </div>
    </>
  );
}
