import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Plus, Trash2, UserCog } from "lucide-react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import app from "@/utils/db/firebase";

type UserRole = "Admin" | "Operator" | "Viewer";
type UserStatus = "Aktif" | "Nonaktif";
type AssignableRole = "Operator" | "Viewer";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

type FirestoreUserDoc = {
  fullname?: string;
  name?: string;
  email?: string;
  nim?: string;
  role?: string;
  status?: string;
};

type NewUserForm = {
  name: string;
  email: string;
  password: string;
  role: AssignableRole;
};

type EditUserForm = {
  id: string;
  name: string;
  role: AssignableRole;
  status: UserStatus;
};

type DeleteTarget = {
  id: string;
  name: string;
};

type ToastType = "success" | "error" | "info";

type ToastState = {
  type: ToastType;
  message: string;
} | null;

const db = getFirestore(app);
const USERS_COLLECTION = "users";

function normalizeRole(role?: string): UserRole {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "admin") {
    return "Admin";
  }

  if (normalizedRole === "operator") {
    return "Operator";
  }

  return "Viewer";
}

function normalizeStatus(status?: string): UserStatus {
  return status === "Nonaktif" ? "Nonaktif" : "Aktif";
}

export default function ManagementUsersView() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [newUser, setNewUser] = useState<NewUserForm>({
    name: "",
    email: "",
    password: "",
    role: "Viewer",
  });
  const [editUser, setEditUser] = useState<EditUserForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const activeUsersCount = useMemo(
    () => users.filter((user) => user.status === "Aktif").length,
    [users],
  );

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3000);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const snapshot = await getDocs(collection(db, USERS_COLLECTION));
      const mappedUsers: UserItem[] = snapshot.docs
        .map((item) => {
          const data = item.data() as FirestoreUserDoc;

          return {
            id: item.id,
            name: data.fullname?.trim() || data.name?.trim() || "Tanpa Nama",
            email: data.email?.trim() || data.nim?.trim() || "-",
            role: normalizeRole(data.role),
            status: normalizeStatus(data.status),
          };
        })
        .filter((user) => user.role !== "Admin");

      setUsers(mappedUsers);
    } catch {
      setErrorMessage("Gagal mengambil data pengguna dari Firebase.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const resetForm = () => {
    setNewUser({ name: "", email: "", password: "", role: "Viewer" });
  };

  const resetEditForm = () => {
    setEditUser(null);
  };

  const resetDeleteForm = () => {
    setDeleteTarget(null);
  };

  const openEditForm = (user: UserItem) => {
    const role: AssignableRole =
      user.role === "Operator" ? "Operator" : "Viewer";

    setEditUser({
      id: user.id,
      name: user.name,
      role,
      status: user.status,
    });
    setShowEditForm(true);
  };

  const openDeleteConfirm = (user: UserItem) => {
    setDeleteTarget({ id: user.id, name: user.name });
    setShowDeleteConfirm(true);
  };

  const handleDeleteUser = async (id: string) => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/auth/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        showToast(
          "Sesi login tidak valid. Mengarahkan ke halaman login...",
          "error",
        );
        setTimeout(() => {
          window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        }, 900);
        return;
      }

      let result: { message?: string } = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        showToast(
          result.message || "Gagal menghapus user dari sistem.",
          "error",
        );
        return;
      }

      setUsers((prev) => prev.filter((user) => user.id !== id));
      resetDeleteForm();
      setShowDeleteConfirm(false);
      showToast("Pengguna berhasil dihapus.", "success");
    } catch {
      showToast("Gagal menghapus user dari sistem.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const preparedName = newUser.name.trim();
    const preparedEmail = newUser.email.trim().toLowerCase();
    if (!preparedName || !preparedEmail || !newUser.password.trim()) {
      showToast("Nama, email, dan password wajib diisi.", "error");
      return;
    }

    if (newUser.password.length < 6) {
      showToast("Password minimal 6 karakter.", "error");
      return;
    }

    if (users.some((user) => user.email.toLowerCase() === preparedEmail)) {
      showToast("Email sudah terdaftar.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/users", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: preparedName,
          email: preparedEmail,
          password: newUser.password,
          role: newUser.role,
          status: "Aktif",
        }),
      });

      if (response.status === 401) {
        showToast(
          "Sesi login tidak valid. Mengarahkan ke halaman login...",
          "error",
        );
        setTimeout(() => {
          window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        }, 900);
        return;
      }

      const result = (await response.json()) as {
        message?: string;
        data?: { id?: string };
      };

      if (!response.ok) {
        showToast(result.message || "Gagal menambahkan user.", "error");
        return;
      }

      setUsers((prev) => [
        {
          id: result.data?.id || String(Date.now()),
          name: preparedName,
          email: preparedEmail,
          role: newUser.role,
          status: "Aktif",
        },
        ...prev,
      ]);

      resetForm();
      setShowAddForm(false);
      showToast("Pengguna berhasil ditambahkan.", "success");
    } catch {
      showToast("Gagal menambahkan user.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editUser) {
      return;
    }

    const preparedName = editUser.name.trim();

    if (!preparedName) {
      showToast("Nama wajib diisi.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/auth/users/${editUser.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: preparedName,
          role: editUser.role,
          status: editUser.status,
        }),
      });

      if (response.status === 401) {
        showToast(
          "Sesi login tidak valid. Mengarahkan ke halaman login...",
          "error",
        );
        setTimeout(() => {
          window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        }, 900);
        return;
      }

      const result = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        showToast(result.message || "Gagal memperbarui user.", "error");
        return;
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === editUser.id
            ? {
                ...user,
                name: preparedName,
                role: editUser.role,
                status: editUser.status,
              }
            : user,
        ),
      );

      resetEditForm();
      setShowEditForm(false);
      showToast("Pengguna berhasil diperbarui.", "success");
    } catch {
      showToast("Gagal memperbarui user.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-900)] text-[var(--text-primary)] px-4 py-8 md:px-8">
      {toast && (
        <div className="fixed right-4 top-4 z-[60] w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 shadow-xl">
          <p
            className={`text-sm font-medium ${
              toast.type === "success"
                ? "text-emerald-400"
                : toast.type === "error"
                  ? "text-rose-400"
                  : "text-cyan-400"
            }`}
          >
            {toast.message}
          </p>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-cyan-400 hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Link>
        </div>

        <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <h1 className="text-2xl font-semibold">Manajemen Pengguna</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Kelola anggota tim yang dapat mengakses dashboard Smart Plant Auto
              Watering System.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            Tambah Pengguna
          </button>
        </section>

        {errorMessage && (
          <section className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
            {errorMessage}
          </section>
        )}

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 xl:col-span-2">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                    <th className="px-3 py-3 font-medium">Nama</th>
                    <th className="px-3 py-3 font-medium">Email/NIM</th>
                    <th className="px-3 py-3 font-medium">Role</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        className="px-3 py-6 text-center text-[var(--text-muted)]"
                        colSpan={5}
                      >
                        Memuat data pengguna...
                      </td>
                    </tr>
                  )}

                  {!loading && users.length === 0 && (
                    <tr>
                      <td
                        className="px-3 py-6 text-center text-[var(--text-muted)]"
                        colSpan={5}
                      >
                        Belum ada data user non-admin.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    users.map((user) => {
                      const isActive = user.status === "Aktif";
                      return (
                        <tr
                          key={user.id}
                          className="border-b border-[var(--border)]/70"
                        >
                          <td className="px-3 py-3 font-medium">{user.name}</td>
                          <td className="px-3 py-3 text-[var(--text-muted)]">
                            {user.email}
                          </td>
                          <td className="px-3 py-3">{user.role}</td>
                          <td className="px-3 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                isActive
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-amber-500/15 text-amber-400"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditForm(user)}
                                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs text-cyan-400 transition hover:border-cyan-400"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeleteConfirm(user)}
                                className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 px-2 py-1 text-xs text-rose-400 transition hover:border-rose-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <UserCog className="h-5 w-5 text-violet-400" />
              Hak Akses Role
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-800)] p-3">
                <p className="text-[var(--text-muted)]">Total User</p>
                <p className="mt-1 text-lg font-semibold">{users.length}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-800)] p-3">
                <p className="text-[var(--text-muted)]">User Aktif</p>
                <p className="mt-1 text-lg font-semibold">{activeUsersCount}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-800)] p-3">
                <p className="font-semibold text-emerald-400">Admin</p>
                <p className="mt-1 text-[var(--text-muted)]">
                  Akses penuh: kelola perangkat, ubah threshold, lihat analitik,
                  dan kelola pengguna.
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-800)] p-3">
                <p className="font-semibold text-cyan-400">Operator</p>
                <p className="mt-1 text-[var(--text-muted)]">
                  Monitor sensor, jalankan mode penyiraman, dan lihat data
                  analitik operasional.
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-800)] p-3">
                <p className="font-semibold text-amber-400">Viewer</p>
                <p className="mt-1 text-[var(--text-muted)]">
                  Akses baca saja: melihat dashboard dan grafik tanpa izin
                  melakukan perubahan.
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
            <h2 className="text-xl font-semibold">Tambah Pengguna Baru</h2>
            <form className="mt-4 space-y-4" onSubmit={handleAddUser}>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Nama</span>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-800)] px-3 py-2 outline-none transition focus:border-emerald-400"
                  placeholder="Nama pengguna"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Email</span>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-800)] px-3 py-2 outline-none transition focus:border-cyan-400"
                  placeholder="email@contoh.com"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Password</span>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-800)] px-3 py-2 outline-none transition focus:border-amber-400"
                  placeholder="Minimal 6 karakter"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Role</span>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      role: e.target.value as AssignableRole,
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-800)] px-3 py-2 outline-none transition focus:border-violet-400"
                >
                  <option value="Operator">Operator</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
                  }}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
                >
                  {submitting ? "Menyimpan..." : "Simpan Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditForm && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
            <h2 className="text-xl font-semibold">Edit Pengguna</h2>
            <form className="mt-4 space-y-4" onSubmit={handleUpdateUser}>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Nama</span>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: e.target.value,
                          }
                        : prev,
                    )
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-800)] px-3 py-2 outline-none transition focus:border-emerald-400"
                  placeholder="Nama pengguna"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Role</span>
                <select
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser((prev) =>
                      prev
                        ? {
                            ...prev,
                            role: e.target.value as AssignableRole,
                          }
                        : prev,
                    )
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-800)] px-3 py-2 outline-none transition focus:border-violet-400"
                >
                  <option value="Operator">Operator</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">Status</span>
                <select
                  value={editUser.status}
                  onChange={(e) =>
                    setEditUser((prev) =>
                      prev
                        ? {
                            ...prev,
                            status: e.target.value as UserStatus,
                          }
                        : prev,
                    )
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-800)] px-3 py-2 outline-none transition focus:border-cyan-400"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetEditForm();
                    setShowEditForm(false);
                  }}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5">
            <h2 className="text-xl font-semibold">Konfirmasi Hapus</h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Yakin ingin menghapus pengguna{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {deleteTarget.name}
              </span>
              ?
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  resetDeleteForm();
                  setShowDeleteConfirm(false);
                }}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDeleteUser(deleteTarget.id)}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-rose-400"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
