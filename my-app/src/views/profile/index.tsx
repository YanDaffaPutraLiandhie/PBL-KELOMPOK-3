"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.scss";
import AvatarUploader from "../../components/AvatarUploader";
import ReadOnlyField from "../../components/ReadOnlyField";

export default function ProfileView() {
  const { data: session, status, update }: any = useSession();
  const user = session?.user || null;

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const initialName = useRef("");

  useEffect(() => {
    if (user) {
      const startingName = user.fullname || user.name || "";
      setName(startingName);
      setRole(user.role || "Member");
      setPreviewUrl(user.image || "/avatar-head.svg");
      initialName.current = startingName;
    }
  }, [user]);

  const isDirty = name.trim() !== initialName.current;

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage("Nama tidak boleh kosong");
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        setMessage("Profil berhasil diperbarui!");
        initialName.current = name.trim();

        await update({
          ...session,
          user: { ...session.user, fullname: name.trim() },
        });

        setTimeout(() => setMessage(null), 3000);
      } else {
        const errData = await res.json();
        setMessage(errData.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      setMessage("Terjadi kesalahan sistem");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") return <div className={styles.container}>Memuat...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        {/* SIDEBAR */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <h1 className={styles.heading}>Profil Saya</h1>
          </div>

          {/* PERUBAHAN DI SINI: Kita tidak pakai AvatarUploader lagi, tapi img biasa */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatarInner}>
                <img 
                  src={previewUrl || "/avatar-head.svg"} 
                  alt="avatar" 
                  className={styles.avatar} 
                />
              </div>
            </div>
            {/* Label klik foto dihapus */}
          </div>

          <div className={styles.sidebarBottom}>
            <div className={styles.emailBadge}>{user?.email}</div>
            <button 
              onClick={() => {
                if (isDirty && !confirm("Belum disimpan. Yakin kembali?")) return;
                router.back();
              }} 
              className={styles.btnBack}
            >
              Kembali
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>Informasi Akun</h2>
          
          {message && <div className={styles.alert}>{message}</div>}

          <div className={styles.field}>
            <label>Nama Lengkap</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

          <ReadOnlyField
            label="Role"
            value={role}
            containerClass={styles.field}
            inputClass={styles.readOnly}
          />

          <div className={styles.formActions}>
            <button 
              onClick={handleSave} 
              className={styles.btnSave} 
              disabled={!isDirty || isSaving}
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}