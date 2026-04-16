"use client";

import React from "react";

type Props = {
  previewUrl?: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  text?: string;
  className?: string;
  styles?: any;
};

export default function AvatarUploader({ previewUrl, onFileChange, id = "avatar-input", text = "Klik foto untuk ubah", className = "", styles = {} }: Props) {
  const avatarLabel = styles.avatarLabel || "avatarLabel";
  const avatarWrap = styles.avatarWrap || "avatarWrap";
  const avatarInner = styles.avatarInner || "avatarInner";
  const avatarImg = styles.avatar || "avatar";
  const avatarOverlay = styles.avatarOverlay || "avatarOverlay";
  const textUpload = styles.textUpload || "textUpload";

  return (
    <div className={className}>
      <label htmlFor={id} className={avatarLabel}>
        <div className={avatarWrap}>
          <div className={avatarInner}>
            <img src={previewUrl || "/avatar-head.svg"} alt="avatar" className={avatarImg} />
            <div className={avatarOverlay}>Ganti</div>
          </div>
        </div>
      </label>

      <input id={id} type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />

      <label htmlFor={id} className={textUpload}>
        {text}
      </label>
    </div>
  );
}
