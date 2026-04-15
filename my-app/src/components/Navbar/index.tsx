import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import style from "./navbar.module.scss";

const Navbar = () => {
  const { data: session }: any = useSession();
  const { push } = useRouter();

  return (
    <nav className={style.navbar}>
      <div className={style.navbar__logo} onClick={() => push("/")}>
        PBL-APP
      </div>

      <div className={style.navbar__menu}>
        {session ? (
          <>
            <div className={style.navbar__menu__user}>
              Status: <span className="status-badge">ONLINE</span> | {session.user.fullname}
            </div>
            <button 
              onClick={() => signOut()} 
              className="btn-quick" 
              style={{ borderColor: '#ef4444', color: '#ef4444' }}
            >
              Terminate Session
            </button>
          </>
        ) : (
          <button 
            onClick={() => push("/auth/login")} 
            className="btn-quick" 
            style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
          >
            Access System
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;