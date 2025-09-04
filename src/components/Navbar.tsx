import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth, loginWithGoogle, logout } from "../lib/auth";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const user = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
    const params = new URLSearchParams(loc.search);
    if (q) params.set("q", q);
    else params.delete("q");
    nav({ pathname: "/", search: params.toString() });
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#fff3fa",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "10px 16px",
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "#111",
          }}
        >
          <img
            src="/logoVanes.png"
            alt="Logo"
            style={{ width: 100, height: 60, objectFit: "contain" }}
          />
        </Link>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <form onSubmit={onSearch} style={{ display: "flex" }}>
            <input
              name="q"
              defaultValue={new URLSearchParams(loc.search).get("q") ?? ""}
              placeholder="Search documents..."
              style={{
                width: 250,
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #ead3de",
                outline: "none",
                background: "#fff",
              }}
            />
          </form>

          {user ? (
            <>
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                Hello Vanes!
              </span>

              <Link to="/doc/new" className={styles.btnNew}>
                + New
              </Link>
              <button onClick={logout} className={styles.btnDark}>
                Logout
              </button>
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
