import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import Header from "@/components/Header";
import Modal from "@/components/Modal";

type UserRole = "Operator" | "Viewer" | "Admin";
type UserStatus = "Aktif" | "Nonaktif";

interface User {
  id: string;
  fullname: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

type FormValues = {
  fullname: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
};

type ApiResponse<T> = {
  status: boolean;
  message: string;
  data?: T;
};

const defaultValues: FormValues = {
  fullname: "",
  email: "",
  role: "Viewer",
  status: "Aktif",
  password: "",
};

function normalizeRole(value?: string): UserRole {
  const normalizedRole = String(value || "")
    .trim()
    .toLowerCase();

  if (normalizedRole === "admin") return "Admin";
  if (normalizedRole === "operator") return "Operator";
  return "Viewer";
}

function normalizeStatus(value?: string): UserStatus {
  return value === "Nonaktif" ? "Nonaktif" : "Aktif";
}

export default function Users() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isOnline] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [popup, setPopup] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { register, handleSubmit, reset, formState, setValue } =
    useForm<FormValues>({ defaultValues });

  const labelClassName =
    "block text-[0.78rem] mb-2 uppercase tracking-[0.08em]";
  const fieldClassName =
    "w-full border rounded-lg px-4 py-3 text-sm transition-all placeholder:opacity-50 focus:outline-none";
  const fieldStyle = {
    background: "var(--bg-600)",
    borderColor: "var(--border)",
    color: "var(--text-primary)",
    fontFamily: "'Exo 2', sans-serif",
  } as const;

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/users");
      const result = (await response.json()) as ApiResponse<User[]>;

      if (!response.ok || !result.status) {
        throw new Error(result.message || "Gagal memuat data pengguna");
      }

      setUsers(
        Array.isArray(result.data)
          ? result.data.map((user) => ({
            ...user,
            role: normalizeRole(user.role),
            status: normalizeStatus(user.status),
          }))
          : [],
      );
    } catch (err: any) {
      console.error(err);
      setPopup({
        type: "error",
        message: err.message || "Gagal memuat data pengguna",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleCreate(data: FormValues) {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: data.fullname,
          email: data.email,
          password: data.password,
          role: data.role,
          status: data.status,
        }),
      });

      const result = (await response.json()) as ApiResponse<{ id: string }>;

      if (!response.ok || !result.status) {
        throw new Error(result.message || "Gagal membuat user");
      }

      setPopup({ type: "success", message: "User berhasil dibuat" });
      setIsModalOpen(false);
      reset(defaultValues);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      setPopup({ type: "error", message: err.message || "Gagal membuat user" });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string, data: FormValues) {
    try {
      setLoading(true);
      const response = await fetch(`/api/auth/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: data.fullname,
          email: data.email,
          role: data.role,
          status: data.status,
        }),
      });

      const result = (await response.json()) as ApiResponse<{ id: string }>;

      if (!response.ok || !result.status) {
        throw new Error(result.message || "Gagal memperbarui user");
      }

      setPopup({ type: "success", message: "User berhasil diperbarui" });
      setIsModalOpen(false);
      setEditingUser(null);
      reset(defaultValues);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      setPopup({
        type: "error",
        message: err.message || "Gagal memperbarui user",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setLoading(true);
      setDeleteError(null);
      const response = await fetch(`/api/auth/users/${id}`, {
        method: "DELETE",
      });

      const result = (await response.json()) as ApiResponse<null>;

      if (!response.ok || !result.status) {
        throw new Error(result.message || "Gagal menghapus user");
      }

      setPopup({ type: "success", message: "User berhasil dihapus" });
      setDeleteTarget(null);
      setDeleteError(null);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      setDeleteError(err.message || "Gagal menghapus user");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    reset(defaultValues);
    setEditingUser(null);
    setIsModalOpen(true);
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setValue("fullname", user.fullname);
    setValue("email", user.email);
    setValue("role", user.role);
    setValue("status", user.status);
    setIsModalOpen(true);
  }

  const onSubmit = handleSubmit(async (values) => {
    if (editingUser) {
      await handleUpdate(editingUser.id, values);
      return;
    }

    await handleCreate(values);
  });

  return (
    <div className={theme}>
      <div
        className="min-h-screen"
        style={{ background: "var(--bg-900)", color: "var(--text-primary)" }}
      >
        <Header theme={theme} onToggleTheme={toggleTheme} isOnline={isOnline} />

        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="card glow-border p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-2xl font-bold glow-text">
                    Manajemen User
                  </h2>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Kelola akun, role, dan status akses pengguna.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/"
                    className="btn-quick inline-flex items-center"
                    style={{
                      color: "var(--text-primary)",
                      borderColor: "var(--border)",
                      background: "rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    ← Dashboard
                  </Link>
                  <button
                    onClick={openCreateModal}
                    className="btn-quick inline-flex items-center"
                    style={{
                      color: "var(--primary)",
                      borderColor: "var(--primary)",
                      background: "rgba(0, 229, 160, 0.08)",
                    }}
                  >
                    + Tambah User
                  </button>
                </div>
              </div>

              {loading && (
                <div
                  className="mb-4 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Memuat...
                </div>
              )}

              <div
                className="overflow-x-auto rounded-xl border"
                style={{ borderColor: "var(--border)" }}
              >
                <table className="min-w-full table-auto text-sm">
                  <thead>
                    <tr style={{ background: "var(--bg-800)" }}>
                      <th
                        className="px-4 py-3 text-left text-xs uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Full Name
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Email
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Role
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Status
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b transition-colors"
                        style={{ borderColor: "var(--border)" }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.background =
                            "rgba(0, 200, 255, 0.06)";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td className="px-4 py-3">{user.fullname}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              background:
                                user.role === "Operator"
                                  ? "rgba(124, 58, 237, 0.2)"
                                  : "rgba(0, 200, 255, 0.18)",
                              color:
                                user.role === "Operator"
                                  ? "#c4b5fd"
                                  : "#67e8f9",
                              border: "1px solid",
                              borderColor:
                                user.role === "Operator"
                                  ? "rgba(124, 58, 237, 0.45)"
                                  : "rgba(0, 200, 255, 0.4)",
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              background:
                                user.status === "Aktif"
                                  ? "rgba(0, 229, 160, 0.18)"
                                  : "rgba(239, 68, 68, 0.18)",
                              color:
                                user.status === "Aktif" ? "#6ee7b7" : "#fca5a5",
                              border: "1px solid",
                              borderColor:
                                user.status === "Aktif"
                                  ? "rgba(0, 229, 160, 0.45)"
                                  : "rgba(239, 68, 68, 0.45)",
                            }}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="px-3 py-1 text-xs rounded border transition-all hover:-translate-y-0.5"
                              style={{
                                color: "#facc15",
                                borderColor: "rgba(250, 204, 21, 0.45)",
                                background: "rgba(250, 204, 21, 0.12)",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="px-3 py-1 text-xs rounded border transition-all hover:-translate-y-0.5"
                              style={{
                                color: "#fca5a5",
                                borderColor: "rgba(239, 68, 68, 0.45)",
                                background: "rgba(239, 68, 68, 0.14)",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && !loading && (
                  <div
                    className="mt-4 p-4 text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Tidak ada data user.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Modal
          isOpen={popup !== null}
          onClose={() => setPopup(null)}
          title={popup?.type === "success" ? "Berhasil" : "Terjadi Kesalahan"}
        >
          <div className="space-y-4">
            <p style={{ color: "var(--text-primary)" }}>{popup?.message}</p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPopup(null)}
                className="px-4 py-2 rounded"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--secondary))",
                  color: "#041019",
                  fontWeight: 700,
                }}
              >
                OK
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={deleteTarget !== null}
          onClose={() => {
            setDeleteTarget(null);
            setDeleteError(null);
          }}
          title="Konfirmasi Hapus"
        >
          <div className="space-y-4">
            <p style={{ color: "var(--text-primary)" }}>
              Hapus user{" "}
              <span className="font-semibold">{deleteTarget?.fullname}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            {deleteError && (
              <div
                className="rounded border px-3 py-2 text-sm"
                style={{
                  background: "rgba(239, 68, 68, 0.16)",
                  borderColor: "rgba(239, 68, 68, 0.45)",
                  color: "#fca5a5",
                }}
              >
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded border"
                style={{
                  color: "var(--text-muted)",
                  borderColor: "var(--border)",
                  background: "var(--bg-800)",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteTarget) {
                    void handleDelete(deleteTarget.id);
                  }
                }}
                className="px-4 py-2 rounded"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #f97316)",
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingUser ? "Edit User" : "Buat User"}
        >
          <form
            onSubmit={onSubmit}
            className="space-y-4"
            style={{ color: "var(--text-primary)" }}
          >
            <div>
              <label
                className={labelClassName}
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "'Share Tech Mono', monospace",
                }}
              >
                Full Name
              </label>
              <input
                {...register("fullname", { required: true })}
                placeholder="Fullname"
                className={fieldClassName}
                style={fieldStyle}
                onFocus={(event) => {
                  event.currentTarget.style.borderColor = "var(--primary)";
                  event.currentTarget.style.boxShadow =
                    "0 0 10px rgba(0, 229, 160, 0.2)";
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor = "var(--border)";
                  event.currentTarget.style.boxShadow = "none";
                }}
              />
              {formState.errors?.fullname && (
                <p className="text-red-600 text-sm">Fullname wajib diisi</p>
              )}
            </div>

            <div>
              <label
                className={labelClassName}
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "'Share Tech Mono', monospace",
                }}
              >
                Email
              </label>
              <input
                {...register("email", { required: true })}
                placeholder="Email"
                className={fieldClassName}
                style={fieldStyle}
                onFocus={(event) => {
                  event.currentTarget.style.borderColor = "var(--primary)";
                  event.currentTarget.style.boxShadow =
                    "0 0 10px rgba(0, 229, 160, 0.2)";
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor = "var(--border)";
                  event.currentTarget.style.boxShadow = "none";
                }}
              />
              {formState.errors?.email && (
                <p className="text-red-600 text-sm">Email wajib diisi</p>
              )}
            </div>

            {!editingUser && (
              <div>
                <label
                  className={labelClassName}
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "'Share Tech Mono', monospace",
                  }}
                >
                  Password (opsional)
                </label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Password"
                  className={fieldClassName}
                  style={fieldStyle}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = "var(--primary)";
                    event.currentTarget.style.boxShadow =
                      "0 0 10px rgba(0, 229, 160, 0.2)";
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = "var(--border)";
                    event.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={labelClassName}
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "'Share Tech Mono', monospace",
                  }}
                >
                  Role
                </label>
                <select
                  {...register("role")}
                  className={fieldClassName}
                  style={fieldStyle}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = "var(--primary)";
                    event.currentTarget.style.boxShadow =
                      "0 0 10px rgba(0, 229, 160, 0.2)";
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = "var(--border)";
                    event.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value="Admin">Admin</option>
                  <option value="Operator">Operator</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label
                  className={labelClassName}
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "'Share Tech Mono', monospace",
                  }}
                >
                  Status
                </label>
                <select
                  {...register("status")}
                  className={fieldClassName}
                  style={fieldStyle}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = "var(--primary)";
                    event.currentTarget.style.boxShadow =
                      "0 0 10px rgba(0, 229, 160, 0.2)";
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = "var(--border)";
                    event.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingUser(null);
                  reset(defaultValues);
                }}
                className="px-4 py-2 rounded border"
                style={{
                  color: "var(--text-muted)",
                  borderColor: "var(--border)",
                  background: "var(--bg-800)",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--secondary))",
                  color: "#041019",
                  fontWeight: 700,
                }}
              >
                {editingUser ? "Simpan" : "Buat"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
