import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            <span className={styles.logoIcon}>🚗</span>
            <span className={styles.logoText}>DriveNow</span>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/vehicles" className={styles.navLink}>
            Vehicles
          </Link>
          <Link href="/bookings" className={styles.navLink}>
            My Bookings
          </Link>
          <Link href="/contact" className={styles.navLink}>
            Contact
          </Link>
          <ThemeToggle />
          <Link href="#" className={styles.btnNav}>
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
