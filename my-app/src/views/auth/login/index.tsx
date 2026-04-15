import Link from "next/link";
import style from "../../auth/login/login.module.scss";
import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

const TampilanLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { push, query } = useRouter();
  const callbackUrl = (query.callbackUrl as string) || "/";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (!res?.error) {
        push(callbackUrl);
      } else {
        setError("Email atau password salah");
      }
    } catch (err) {
      setError("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={style.login}>
      <h1 className={style.login__title}>Halaman Login</h1>

      <div className={style.login__form}>
        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className={style.login__form__item}>
            <label className={style.login__form__item__label}>
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={style.login__form__item__input}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className={style.login__form__item}>
            <label className={style.login__form__item__label}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={style.login__form__item__input}
              required
            />
          </div>

          {/* ERROR */}
          {error && (
            <p className={style.login__error}>{error}</p>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className={style.login__form__item__button}
            disabled={isLoading}
           >
            {isLoading ? "Loading..." : "Login"}
          </button>

          <br /><br />

          {/* GOOGLE LOGIN */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className={style.login__form__item__button}
            disabled={isLoading}
          >
            Sign in with Google
          </button>
        </form>

        <br />

        {/* LUPA PASSWORD */}
        <p className={style.login__form__item__text}>
          <Link href="/auth/forgot-password">Lupa Password?</Link>
        </p>

        {/* REGISTER */}
        <p className={style.login__form__item__text}>
          Belum punya akun?{" "}
          <Link href="/auth/register">Ke Halaman Register</Link>
        </p>
      </div>
    </div>
  );
};

export default TampilanLogin;