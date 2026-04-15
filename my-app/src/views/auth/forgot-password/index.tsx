import Link from "next/link";
import style from "../../auth/login/login.module.scss";
import { useState } from "react";
import { auth } from "../../../utils/db/firebase"; 
import { sendPasswordResetEmail } from "firebase/auth";

const TampilanForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    const email = event.target.email.value;

    try {
      // Mengirim email reset password via Firebase SDK
      await sendPasswordResetEmail(auth, email);
      setMessage("Link reset password telah dikirim ke email kamu!");
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setError("Email tidak ditemukan atau terjadi kesalahan.");
    }
  };

  return (
    <div className={style.login}>
      <h1 className={style.login__title}>Lupa Password</h1>
      <div className={style.login__form}>
        <form onSubmit={handleSubmit}>
          <div className={style.login__form__item}>
            <label htmlFor="email" className={style.login__form__item__label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Masukkan email terdaftar"
              className={style.login__form__item__input}
              required
            />
          </div>

          {error && <p className={style.login__error}>{error}</p>}
          {message && <p style={{ color: "green", fontSize: "14px", marginBottom: "10px" }}>{message}</p>}

          <button
            type="submit"
            className={style.login__form__item__button}
            disabled={isLoading}
          >
            {isLoading ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>

        <br />
        <p className={style.login__form__item__text}>
          Sudah ingat password? <Link href="/auth/login">Kembali ke Login</Link>
        </p>
      </div>
    </div>
  );
};

export default TampilanForgotPassword;