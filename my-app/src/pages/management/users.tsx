import Head from "next/head";
import { useState } from "react";
import { Plus, Trash2, UserCog } from "lucide-react";

type UserRole = "Admin" | "Operator" | "Viewer";
type UserStatus = "Aktif" | "Nonaktif";

type UserItem = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

const initialUsers: UserItem[] = [
  {
    id: 1,
    name: "Hamdan",
    email: "hamdan@example.com",
    role: "Admin",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Dhanisa",
    email: "dhanisa@example.com",
    role: "Operator",
    status: "Aktif",
  },
  {
    id: 3,
    name: "Yan Daffa",
    email: "yandaffa@example.com",
    role: "Viewer",
    status: "Nonaktif",
  },
];

type NewUserForm = {
  name: string;
  email: string;
  role: UserRole;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>({
    name: "",
    email: "",
    role: "Viewer",
  });

  const handleDeleteUser = (id: number) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const handleAddUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const preparedName = newUser.name.trim();
    const preparedEmail = newUser.email.trim();
    if (!preparedName || !preparedEmail) {
      alert("Nama dan email wajib diisi.");
      return;
    }

    const user: UserItem = {
      id: Date.now(),
      name: preparedName,
      email: preparedEmail,
      role: newUser.role,
      status: "Aktif",
    };

    setUsers((prev) => [user, ...prev]);
    setNewUser({ name: "", email: "", role: "Viewer" });
    setShowAddForm(false);
  };

  return (
    <>
      <Head>
        <title>User Management | Smart Plant Auto Watering</title>
        <meta
          name="description"
          content="Manajemen pengguna dan hak akses dashboard irigasi"
        />
      </Head>

      <main className="min-h-screen bg-[var(--bg-900)] text-[var(--text-primary)] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <h1 className="text-2xl font-semibold">Manajemen Pengguna</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Kelola anggota tim yang dapat mengakses dashboard Smart Plant
                Auto Watering System.
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
                    {users.map((user) => {
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
                                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs text-cyan-400 transition hover:border-cyan-400"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user.id)}
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
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-800)] p-3">
                  <p className="font-semibold text-emerald-400">Admin</p>
                  <p className="mt-1 text-[var(--text-muted)]">
                    Akses penuh: kelola perangkat, ubah threshold, lihat
                    analitik, dan kelola pengguna.
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
                  <span className="text-sm font-medium">Role</span>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        role: e.target.value as UserRole,
                      }))
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-800)] px-3 py-2 outline-none transition focus:border-violet-400"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Operator">Operator</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </label>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
                  >
                    Simpan Pengguna
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
