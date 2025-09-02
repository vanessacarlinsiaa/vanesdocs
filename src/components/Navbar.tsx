import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") ?? "";

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.brand}>
        <img
          src="/logoVanes.png"
          alt="VanesDocs Logo"
          className={styles.logo}
        />
      </Link>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/?q=${encodeURIComponent(q)}`);
        }}
        className={styles.form}
      >
        <input
          value={q}
          onChange={(e) => setParams({ q: e.target.value })}
          placeholder="Search document..."
          className={styles.input}
        />
      </form>

      <Link to="/doc/new" className={styles.newBtn}>
        + New
      </Link>
    </nav>
  );
}
