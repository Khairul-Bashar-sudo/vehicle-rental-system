"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import styles from "./Header.module.css";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

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
          {user && (
            <Link href="/bookings" className={styles.navLink}>
              My Bookings
            </Link>
          )}
          <Link href="/contact" className={styles.navLink}>
            Contact
          </Link>
          <Link href="/admin" className={styles.navLink}>
            Admin
          </Link>
          <ThemeToggle />
          {user ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className={styles.btnNav}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login" className={styles.btnNav}>
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
