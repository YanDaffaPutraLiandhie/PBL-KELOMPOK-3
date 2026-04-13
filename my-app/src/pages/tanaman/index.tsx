import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Pencil, Trash2, Plus, Leaf, Sun, Moon } from "lucide-react";

interface Plant {
  id: string;
  name: string;
  species: string;
  minHumidity: number;
  maxHumidity: number;
  minTemperature: number;
  maxTemperature: number;
  zone: string;
  plantedAt: string;
}

interface PlantForm {
  name: string;
  species: string;
  minHumidity: string;
  maxHumidity: string;
  minTemperature: string;
  maxTemperature: string;
  zone: string;
  plantedAt: string;
}

const initialPlants: Plant[] = [
  {
    id: "PLANT-001",
    name: "Cabai Blok A",
    species: "Capsicum annuum",
    minHumidity: 40,
    maxHumidity: 80,
    minTemperature: 22,
    maxTemperature: 30,
    zone: "Zona A1",
    plantedAt: "2026-03-01",
  },
  {
    id: "PLANT-002",
    name: "Tomat Hidroponik",
    species: "Solanum lycopersicum",
    minHumidity: 45,
    maxHumidity: 78,
    minTemperature: 21,
    maxTemperature: 29,
    zone: "Zona B2",
    plantedAt: "2026-02-20",
  },
];

const emptyForm: PlantForm = {
  name: "",
  species: "",
  minHumidity: "",
  maxHumidity: "",
  minTemperature: "",
  maxTemperature: "",
  zone: "",
  plantedAt: "",
};

export default function PlantManagementPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [plants, setPlants] = useState<Plant[]>(initialPlants);
  const [form, setForm] = useState<PlantForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleInputChange = (key: keyof PlantForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const validateForm = () => {
    const min = Number(form.minHumidity);
    const max = Number(form.maxHumidity);
    const minTemp = Number(form.minTemperature);
    const maxTemp = Number(form.maxTemperature);

    if (!form.name || !form.species || !form.zone || !form.plantedAt) {
      return "Semua field wajib diisi.";
    }

    if (
      Number.isNaN(min) ||
      Number.isNaN(max) ||
      Number.isNaN(minTemp) ||
      Number.isNaN(maxTemp)
    ) {
      return "Threshold kelembaban dan suhu harus berupa angka.";
    }

    if (min < 0 || max > 100) {
      return "Nilai kelembaban harus di rentang 0-100.";
    }

    if (min >= max) {
      return "Min Humidity harus lebih kecil dari Max Humidity.";
    }

    if (minTemp < 0 || maxTemp > 60) {
      return "Nilai suhu harus di rentang 0-60 derajat C.";
    }

    if (minTemp >= maxTemp) {
      return "Min Temperature harus lebih kecil dari Max Temperature.";
    }

    return "";
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const plantPayload: Plant = {
      id: editingId ?? `PLANT-${String(Date.now()).slice(-6)}`,
      name: form.name,
      species: form.species,
      minHumidity: Number(form.minHumidity),
      maxHumidity: Number(form.maxHumidity),
      minTemperature: Number(form.minTemperature),
      maxTemperature: Number(form.maxTemperature),
      zone: form.zone,
      plantedAt: form.plantedAt,
    };

    if (editingId) {
      setPlants((prev) =>
        prev.map((item) => (item.id === editingId ? plantPayload : item)),
      );
    } else {
      setPlants((prev) => [plantPayload, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (plant: Plant) => {
    setEditingId(plant.id);
    setForm({
      name: plant.name,
      species: plant.species,
      minHumidity: String(plant.minHumidity),
      maxHumidity: String(plant.maxHumidity),
      minTemperature: String(plant.minTemperature),
      maxTemperature: String(plant.maxTemperature),
      zone: plant.zone,
      plantedAt: plant.plantedAt,
    });
    setError("");
  };

  const handleDelete = (id: string) => {
    const selectedPlant = plants.find((item) => item.id === id);
    if (!selectedPlant) {
      return;
    }

    const agreed = window.confirm(`Hapus data tanaman ${selectedPlant.name}?`);
    if (!agreed) {
      return;
    }

    setPlants((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <>
      <Head>
        <title>Manajemen Tanaman - Smart Irrigation</title>
        <meta
          name="description"
          content="Pengelolaan data master tanaman untuk Smart Irrigation System"
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
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1
                    className="text-lg font-bold"
                    style={{
                      color: "var(--primary)",
                      fontFamily: "'Exo 2', sans-serif",
                    }}
                  >
                    Manajemen Tanaman
                  </h1>
                  <p
                    className="text-xs"
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "'Share Tech Mono', monospace",
                    }}
                  >
                    Data master tanaman, threshold kelembaban, dan zonasi lahan
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
                  Form Tanaman
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
                    Nama Tanaman
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
                    placeholder="Contoh: Cabai Blok A"
                  />
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Spesies
                  </label>
                  <input
                    type="text"
                    value={form.species}
                    onChange={(e) =>
                      handleInputChange("species", e.target.value)
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Contoh: Capsicum annuum"
                  />
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Zona/Lokasi
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
                    placeholder="Contoh: Zona A1"
                  />
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Min Humidity (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.minHumidity}
                    onChange={(e) =>
                      handleInputChange("minHumidity", e.target.value)
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="40"
                  />
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Max Humidity (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.maxHumidity}
                    onChange={(e) =>
                      handleInputChange("maxHumidity", e.target.value)
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="80"
                  />
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Min Temperature (C)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={form.minTemperature}
                    onChange={(e) =>
                      handleInputChange("minTemperature", e.target.value)
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="22"
                  />
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Max Temperature (C)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={form.maxTemperature}
                    onChange={(e) =>
                      handleInputChange("maxTemperature", e.target.value)
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="30"
                  />
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Tanggal Tanam
                  </label>
                  <input
                    type="date"
                    value={form.plantedAt}
                    onChange={(e) =>
                      handleInputChange("plantedAt", e.target.value)
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
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
                    {editingId ? "Simpan Perubahan" : "Tambah Tanaman"}
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
                  Daftar Data Tanaman
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(0,229,160,0.1)",
                    color: "var(--primary)",
                  }}
                >
                  Total: {plants.length}
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
                      <th className="py-2 pr-3">Spesies</th>
                      <th className="py-2 pr-3">Humidity</th>
                      <th className="py-2 pr-3">Suhu</th>
                      <th className="py-2 pr-3">Zona</th>
                      <th className="py-2 pr-3">Tanggal Tanam</th>
                      <th className="py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plants.map((plant) => (
                      <tr
                        key={plant.id}
                        style={{
                          borderTop: "1px solid var(--border)",
                          color: "var(--text-primary)",
                        }}
                      >
                        <td
                          className="py-2 pr-3"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        >
                          {plant.id}
                        </td>
                        <td className="py-2 pr-3">{plant.name}</td>
                        <td className="py-2 pr-3">{plant.species}</td>
                        <td className="py-2 pr-3">
                          <span style={{ color: "#00e5a0" }}>
                            {plant.minHumidity}%
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>
                            {" "}
                            -{" "}
                          </span>
                          <span style={{ color: "#00c8ff" }}>
                            {plant.maxHumidity}%
                          </span>
                        </td>
                        <td className="py-2 pr-3">
                          <span style={{ color: "#00e5a0" }}>
                            {plant.minTemperature}C
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>
                            {" "}
                            -{" "}
                          </span>
                          <span style={{ color: "#00c8ff" }}>
                            {plant.maxTemperature}C
                          </span>
                        </td>
                        <td className="py-2 pr-3">{plant.zone}</td>
                        <td className="py-2 pr-3">{plant.plantedAt}</td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(plant)}
                              className="w-8 h-8 rounded flex items-center justify-center"
                              style={{
                                background: "rgba(0, 200, 255, 0.14)",
                                color: "#00c8ff",
                                border: "1px solid rgba(0, 200, 255, 0.4)",
                              }}
                              aria-label={`Edit ${plant.name}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(plant.id)}
                              className="w-8 h-8 rounded flex items-center justify-center"
                              style={{
                                background: "rgba(239, 68, 68, 0.14)",
                                color: "#ef4444",
                                border: "1px solid rgba(239, 68, 68, 0.4)",
                              }}
                              aria-label={`Hapus ${plant.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {plants.length === 0 && (
                  <div
                    className="py-8 text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Belum ada data tanaman.
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
