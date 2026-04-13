import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Pencil, Trash2, Plus, Droplets, Sun, Moon } from "lucide-react";

interface Reservoir {
  id: string;
  name: string;
  distanceEmpty: number;
  distanceFull: number;
  criticalWaterLevel: number;
  zone: string;
}

interface ReservoirForm {
  name: string;
  distanceEmpty: string;
  distanceFull: string;
  criticalWaterLevel: string;
  zone: string;
}

const initialReservoirs: Reservoir[] = [
  {
    id: "TANDON-001",
    name: "Tandon Utama",
    distanceEmpty: 50,
    distanceFull: 5,
    criticalWaterLevel: 15,
    zone: "Zona A-B",
  },
  {
    id: "TANDON-002",
    name: "Tandon Backup",
    distanceEmpty: 45,
    distanceFull: 6,
    criticalWaterLevel: 20,
    zone: "Zona C",
  },
];

const emptyForm: ReservoirForm = {
  name: "",
  distanceEmpty: "",
  distanceFull: "",
  criticalWaterLevel: "",
  zone: "",
};

export default function ReservoirManagementPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [reservoirs, setReservoirs] = useState<Reservoir[]>(initialReservoirs);
  const [form, setForm] = useState<ReservoirForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleInputChange = (key: keyof ReservoirForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const validateForm = () => {
    const empty = Number(form.distanceEmpty);
    const full = Number(form.distanceFull);
    const critical = Number(form.criticalWaterLevel);

    if (!form.name || !form.zone) {
      return "Nama tandon dan zona wajib diisi.";
    }

    if (Number.isNaN(empty) || Number.isNaN(full) || Number.isNaN(critical)) {
      return "Jarak dan batas kritis harus berupa angka.";
    }

    if (empty <= 0 || full <= 0 || empty > 200 || full > 200) {
      return "Jarak ultrasonik harus di rentang 1-200 cm.";
    }

    if (full >= empty) {
      return "Jarak penuh harus lebih kecil dari jarak kosong.";
    }

    if (critical < 1 || critical > 100) {
      return "Batas kritis air harus di rentang 1-100%.";
    }

    return "";
  };

  const calculateCurrentLevel = (
    distanceEmpty: number,
    distanceFull: number,
    measuredDistance: number,
  ) => {
    const clamped = Math.min(
      distanceEmpty,
      Math.max(distanceFull, measuredDistance),
    );
    const raw =
      ((distanceEmpty - clamped) / (distanceEmpty - distanceFull)) * 100;
    return Math.round(raw);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload: Reservoir = {
      id: editingId ?? `TANDON-${String(Date.now()).slice(-6)}`,
      name: form.name,
      distanceEmpty: Number(form.distanceEmpty),
      distanceFull: Number(form.distanceFull),
      criticalWaterLevel: Number(form.criticalWaterLevel),
      zone: form.zone,
    };

    if (editingId) {
      setReservoirs((prev) =>
        prev.map((item) => (item.id === editingId ? payload : item)),
      );
    } else {
      setReservoirs((prev) => [payload, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (item: Reservoir) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      distanceEmpty: String(item.distanceEmpty),
      distanceFull: String(item.distanceFull),
      criticalWaterLevel: String(item.criticalWaterLevel),
      zone: item.zone,
    });
    setError("");
  };

  const handleDelete = (id: string) => {
    const selected = reservoirs.find((item) => item.id === id);
    if (!selected) {
      return;
    }

    const agreed = window.confirm(`Hapus data tandon ${selected.name}?`);
    if (!agreed) {
      return;
    }

    setReservoirs((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <>
      <Head>
        <title>Manajemen Tandon - Smart Irrigation</title>
        <meta
          name="description"
          content="Pengelolaan parameter tandon air untuk sistem irigasi"
        />
      </Head>

      <div className={theme}>
        <div
          className="min-h-screen px-4 py-6"
          style={{ background: "var(--bg-900)" }}
        >
          <div className="max-w-7xl mx-auto space-y-4">
            <header className="card p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #00e5a0, #00c8ff)",
                  }}
                >
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1
                    className="text-lg font-bold"
                    style={{
                      color: "var(--primary)",
                      fontFamily: "'Exo 2', sans-serif",
                    }}
                  >
                    Manajemen Tandon
                  </h1>
                  <p
                    className="text-xs"
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "'Share Tech Mono', monospace",
                    }}
                  >
                    Kalibrasi sensor ultrasonik dan batas kritis air
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="btn-quick"
                  style={{
                    borderColor: "var(--primary)",
                    color: "var(--primary)",
                    background: "transparent",
                  }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: "var(--bg-600)",
                    border: "1px solid var(--border)",
                  }}
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun
                      className="w-4 h-4"
                      style={{ color: "var(--primary)" }}
                    />
                  ) : (
                    <Moon
                      className="w-4 h-4"
                      style={{ color: "var(--primary)" }}
                    />
                  )}
                </button>
              </div>
            </header>

            <section className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-xs font-semibold"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "'Share Tech Mono', monospace",
                    letterSpacing: "0.08em",
                  }}
                >
                  Form Tandon
                </h2>
                {editingId && (
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      color: "#00c8ff",
                      background: "rgba(0, 200, 255, 0.12)",
                    }}
                  >
                    Mode Edit: {editingId}
                  </span>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Nama Tandon
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Contoh: Tandon Utama"
                  />
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Zona Layanan
                  </label>
                  <input
                    type="text"
                    value={form.zone}
                    onChange={(e) => handleInputChange("zone", e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Contoh: Zona A-B"
                  />
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Jarak Kosong (cm)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={form.distanceEmpty}
                    onChange={(e) =>
                      handleInputChange("distanceEmpty", e.target.value)
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="50"
                  />
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Jarak Penuh (cm)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={form.distanceFull}
                    onChange={(e) =>
                      handleInputChange("distanceFull", e.target.value)
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="5"
                  />
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Batas Kritis Air (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.criticalWaterLevel}
                    onChange={(e) =>
                      handleInputChange("criticalWaterLevel", e.target.value)
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="15"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex items-center gap-2 mt-1">
                  <button
                    type="submit"
                    className="btn-quick flex items-center gap-1"
                    style={{
                      background: "rgba(0, 229, 160, 0.18)",
                      borderColor: "rgba(0, 229, 160, 0.5)",
                      color: "var(--primary)",
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {editingId ? "Simpan Perubahan" : "Tambah Tandon"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-quick"
                    style={{
                      background: "rgba(100, 116, 139, 0.12)",
                      borderColor: "rgba(100, 116, 139, 0.5)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Reset
                  </button>

                  {error && (
                    <span className="text-xs" style={{ color: "#ef4444" }}>
                      {error}
                    </span>
                  )}
                </div>
              </form>
            </section>

            <section className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-xs font-semibold"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "'Share Tech Mono', monospace",
                    letterSpacing: "0.08em",
                  }}
                >
                  Daftar Data Tandon
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(0,229,160,0.1)",
                    color: "var(--primary)",
                  }}
                >
                  Total: {reservoirs.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{ color: "var(--text-muted)", textAlign: "left" }}
                    >
                      <th className="py-2 pr-3">ID</th>
                      <th className="py-2 pr-3">Nama</th>
                      <th className="py-2 pr-3">Kalibrasi</th>
                      <th className="py-2 pr-3">Batas Kritis</th>
                      <th className="py-2 pr-3">Zona</th>
                      <th className="py-2 pr-3">Simulasi Air</th>
                      <th className="py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservoirs.map((item) => {
                      const simulated = calculateCurrentLevel(
                        item.distanceEmpty,
                        item.distanceFull,
                        item.distanceFull +
                          (item.distanceEmpty - item.distanceFull) * 0.6,
                      );
                      const stateColor =
                        simulated <= item.criticalWaterLevel
                          ? "#ef4444"
                          : "#00e5a0";

                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderTop: "1px solid var(--border)",
                            color: "var(--text-primary)",
                          }}
                        >
                          <td
                            className="py-2 pr-3"
                            style={{
                              fontFamily: "'Share Tech Mono', monospace",
                            }}
                          >
                            {item.id}
                          </td>
                          <td className="py-2 pr-3">{item.name}</td>
                          <td className="py-2 pr-3">
                            <span style={{ color: "#00e5a0" }}>
                              {item.distanceFull} cm
                            </span>
                            <span style={{ color: "var(--text-muted)" }}>
                              {" "}
                              -{" "}
                            </span>
                            <span style={{ color: "#00c8ff" }}>
                              {item.distanceEmpty} cm
                            </span>
                          </td>
                          <td className="py-2 pr-3">
                            {item.criticalWaterLevel}%
                          </td>
                          <td className="py-2 pr-3">{item.zone}</td>
                          <td className="py-2 pr-3">
                            <span
                              style={{
                                color: stateColor,
                                fontFamily: "'Share Tech Mono', monospace",
                              }}
                            >
                              {simulated}%
                            </span>
                          </td>
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="w-8 h-8 rounded flex items-center justify-center"
                                style={{
                                  background: "rgba(0, 200, 255, 0.14)",
                                  color: "#00c8ff",
                                  border: "1px solid rgba(0, 200, 255, 0.4)",
                                }}
                                aria-label={`Edit ${item.name}`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="w-8 h-8 rounded flex items-center justify-center"
                                style={{
                                  background: "rgba(239, 68, 68, 0.14)",
                                  color: "#ef4444",
                                  border: "1px solid rgba(239, 68, 68, 0.4)",
                                }}
                                aria-label={`Hapus ${item.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {reservoirs.length === 0 && (
                  <div
                    className="py-8 text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Belum ada data tandon.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
