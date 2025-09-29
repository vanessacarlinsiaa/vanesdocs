import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth, loginWithGoogle, logout } from "../lib/auth";
import { useEffect, useRef, useState } from "react";
import styles from "./Navbar.module.css";

type AuthUser = {
  displayName?: string;
  name?: string;
  email?: string;
  photoURL?: string;
};

export default function Navbar() {
  const user = useAuth() as AuthUser | null;
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const displayName =
    user?.displayName ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "User");
  const email = user?.email ?? "";
  const initials = (displayName || "U")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  const [search, setSearch] = useState(
    new URLSearchParams(loc.search).get("q") ?? ""
  );

  useEffect(() => {
    setSearch(new URLSearchParams(loc.search).get("q") ?? "");
  }, [loc.search]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;

    setSearch(v);

    if (v.trim().length) {
      const params = new URLSearchParams(loc.search);
      params.set("q", v);
      nav({ pathname: "/", search: params.toString() });
    } else {
      nav("/", { replace: false });
    }
  };
  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logoLink}>
          <img src="/logoVanes.png" alt="Logo" className={styles.logo} />
        </Link>

        <div className={styles.actions}>
          <form onSubmit={onSearchSubmit} className={styles.searchForm}>
            <input
              type="search"
              name="q"
              value={search}
              onChange={onSearchChange}
              placeholder="Search documents..."
              className={styles.searchInput}
            />
          </form>
          {user ? (
            <>
              <Link to="/doc/new" className={styles.btnNew}>
                + New
              </Link>

              <div ref={menuRef} className={styles.avatarWrapper}>
                <button
                  type="button"
                  onClick={() => setOpen((s) => !s)}
                  className={styles.avatarBtn}
                  aria-label="Open profile menu"
                >
                  {initials}
                </button>

                {open && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownAvatar}>{initials}</div>
                      <div className={styles.dropdownInfo}>
                        <div className={styles.name} title={displayName}>
                          {displayName}
                        </div>
                        <div className={styles.email} title={email}>
                          {email}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        logout();
                      }}
                      className={styles.logoutBtn}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button onClick={loginWithGoogle} className={styles.btnPink}>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
