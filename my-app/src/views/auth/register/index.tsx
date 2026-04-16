import Link from "next/link";
import style from "../../auth/login/login.module.scss"; // P
import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

const TampilanRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const data = {
        fullname: event.target.fullname.value,
        email: event.target.email.value,
        password: event.target.password.value,
    }

    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.status === 200) {
            setIsLoading(false);
            push("/auth/login"); // Balik nang login nek sukses
        } else {
            setIsLoading(false);
            const result = await res.json();
            setError(result.message || "Registration failed");
        }
    } catch (error) {
        setIsLoading(false);
        setError("Something went wrong");
    }
  };

  return (
    <div className={style.login}>
      <h1 className={style.login__title}>Halaman Register</h1>
      <div className={style.login__form}>
        <form onSubmit={handleSubmit}>
          {/* Tambahan input Fullname gawe Register */}
          <div className={style.login__form__item}>
            <label htmlFor="fullname" className={style.login__form__item__label}>
              Fullname
            </label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              placeholder="Fullname"
              className={style.login__form__item__input}
              required
            />
          </div>

          <div className={style.login__form__item}>
            <label htmlFor="email" className={style.login__form__item__label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              className={style.login__form__item__input}
              required
            />
          </div>

          <div className={style.login__form__item}>
            <label htmlFor="password" className={style.login__form__item__label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              className={style.login__form__item__input}
              required
            />
          </div>

          {error && <p className={style.login__error}>{error}</p>}

          <button
            type="submit"
            className={style.login__form__item__button}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Register"}
          </button>

          <br /> <br />
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/", redirect: false })}
            className={style.login__form__item__button}
          >
            Sign up with Google
          </button>
        </form>

        <br />
        <p className={style.login__form__item__text}>
          Sudah punya akun?{" "}
          <Link href="/auth/login">Ke Halaman Login</Link>
        </p>
      </div>
    </div>
  );
};

export default TampilanRegister;