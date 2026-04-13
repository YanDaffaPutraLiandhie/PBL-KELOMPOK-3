import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Pencil, Trash2, Plus, Users, Sun, Moon } from "lucide-react";

interface UserEntity {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Operator" | "Viewer";
  accessZone: string;
}

interface UserForm {
  name: string;
  email: string;
  role: "Admin" | "Operator" | "Viewer";
  accessZone: string;
}

const initialUsers: UserEntity[] = [
  {
    id: "USR-001",
    name: "Hamdan",
    email: "hamdan@smartirrigation.id",
    role: "Admin",
    accessZone: "Semua Zona",
  },
  {
    id: "USR-002",
    name: "Operator A",
    email: "operator.a@smartirrigation.id",
    role: "Operator",
    accessZone: "Zona A-B",
  },
];

const emptyForm: UserForm = {
  name: "",
  email: "",
  role: "Viewer",
  accessZone: "",
};

export default function AccountManagementPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [users, setUsers] = useState<UserEntity[]>(initialUsers);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleInputChange = <K extends keyof UserForm>(
    key: K,
    value: UserForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const validateForm = () => {
    if (!form.name || !form.email || !form.accessZone) {
      return "Nama, email, dan akses zona wajib diisi.";
    }

    if (!validateEmail(form.email)) {
      return "Format email tidak valid.";
    }

    const duplicate = users.some(
      (item) =>
        item.email.toLowerCase() === form.email.toLowerCase() &&
        item.id !== editingId,
    );

    if (duplicate) {
      return "Email sudah terdaftar.";
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

    const payload: UserEntity = {
      id: editingId ?? `USR-${String(Date.now()).slice(-6)}`,
      name: form.name,
      email: form.email,
      role: form.role,
      accessZone: form.accessZone,
    };

    if (editingId) {
      setUsers((prev) =>
        prev.map((item) => (item.id === editingId ? payload : item)),
      );
    } else {
      setUsers((prev) => [payload, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (item: UserEntity) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      email: item.email,
      role: item.role,
      accessZone: item.accessZone,
    });
    setError("");
  };

  const handleDelete = (id: string) => {
    const selected = users.find((item) => item.id === id);
    if (!selected) {
      return;
    }

    const agreed = window.confirm(`Hapus akun ${selected.name}?`);
    if (!agreed) {
      return;
    }

    setUsers((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  const roleColor: Record<UserEntity["role"], string> = {
    Admin: "#00e5a0",
    Operator: "#00c8ff",
    Viewer: "#f59e0b",
  };

  return (
    <>
      <Head>
        <title>Manajemen Akun - Smart Irrigation</title>
        <meta
          name="description"
          content="Pengelolaan akun internal oleh super admin untuk Smart Irrigation"
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
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1
                    className="text-lg font-bold"
                    style={{
                      color: "var(--primary)",
                      fontFamily: "'Exo 2', sans-serif",
                    }}
                  >
                    Manajemen Akun
                  </h1>
                  <p
                    className="text-xs"
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "'Share Tech Mono', monospace",
                    }}
                  >
                    Provisioning akun internal: dibuat oleh super admin tanpa
                    registrasi mandiri
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
                  Form Akun
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
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
              >
                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Nama
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
                    placeholder="Nama pengguna"
                  />
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="nama@email.com"
                  />
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      handleInputChange(
                        "role",
                        e.target.value as UserEntity["role"],
                      )
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Operator">Operator</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Akses Zona
                  </label>
                  <input
                    type="text"
                    value={form.accessZone}
                    onChange={(e) =>
                      handleInputChange("accessZone", e.target.value)
                    }
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                    style={{
                      background: "var(--bg-600)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Contoh: Zona A-B"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-4 flex items-center gap-2 mt-1">
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
                    {editingId ? "Simpan Perubahan" : "Tambah Akun"}
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
                  Daftar Akun
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(0,229,160,0.1)",
                    color: "var(--primary)",
                  }}
                >
                  Total: {users.length}
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
                      <th className="py-2 pr-3">Email</th>
                      <th className="py-2 pr-3">Role</th>
                      <th className="py-2 pr-3">Akses Zona</th>
                      <th className="py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr
                        key={item.id}
                        style={{
                          borderTop: "1px solid var(--border)",
                          color: "var(--text-primary)",
                        }}
                      >
                        <td
                          className="py-2 pr-3"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        >
                          {item.id}
                        </td>
                        <td className="py-2 pr-3">{item.name}</td>
                        <td className="py-2 pr-3">{item.email}</td>
                        <td className="py-2 pr-3">
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              color: roleColor[item.role],
                              background: `${roleColor[item.role]}20`,
                              border: `1px solid ${roleColor[item.role]}50`,
                            }}
                          >
                            {item.role}
                          </span>
                        </td>
                        <td className="py-2 pr-3">{item.accessZone}</td>
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
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && (
                  <div
                    className="py-8 text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Belum ada data akun.
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
