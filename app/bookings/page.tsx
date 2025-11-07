"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Bookings.module.css";

interface Booking {
  id: number;
  vehicle_id: string;
  vehicle_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  days: number;
  total_price: number;
  created_at: string;
}

function getStatusBadge(startDate: string, endDate: string) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return <span className={`${styles.badge} ${styles.confirmed}`}>Upcoming</span>;
  } else if (now >= start && now <= end) {
    return <span className={`${styles.badge} ${styles.active}`}>Active</span>;
  } else {
    return <span className={`${styles.badge} ${styles.completed}`}>Completed</span>;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/bookings");
      return;
    }

    if (user) {
      fetchBookings();
    }
  }, [user, authLoading, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings");
      
      if (response.status === 401) {
        router.push("/login?redirect=/bookings");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        setError("Failed to load bookings");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className={styles.bookingsPage}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your bookings...</p>
        </div>
      </main>
    );
  }

  const upcomingBookings = bookings.filter(b => new Date(b.start_date) > new Date());
  const activeBookings = bookings.filter(b => {
    const now = new Date();
    return new Date(b.start_date) <= now && new Date(b.end_date) >= now;
  });
  const completedBookings = bookings.filter(b => new Date(b.end_date) < new Date());
  const totalSpent = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);

  return (
    <main className={styles.bookingsPage}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>My Bookings</h1>
          <p className={styles.subtitle}>
            View and manage all your vehicle rental bookings
          </p>
        </div>
      </div>

      <div className={styles.container}>
        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{upcomingBookings.length}</div>
              <div className={styles.statLabel}>Upcoming</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🚗</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{activeBookings.length}</div>
              <div className={styles.statLabel}>Active</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{completedBookings.length}</div>
              <div className={styles.statLabel}>Completed</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>${totalSpent.toFixed(0)}</div>
              <div className={styles.statLabel}>Total Spent</div>
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={fetchBookings} className={styles.retryBtn}>
              Try Again
            </button>
          </div>
        )}

        {/* Bookings List */}
        <div className={styles.bookingsSection}>
          {bookings.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🚗</div>
              <h2>No Bookings Yet</h2>
              <p>You haven't made any vehicle rentals yet. Start exploring our fleet!</p>
              <Link href="/vehicles" className={styles.btnPrimary}>
                Browse Vehicles
              </Link>
            </div>
          ) : (
            <div className={styles.bookingsList}>
              {bookings.map((booking) => (
                <div key={booking.id} className={styles.bookingCard}>
                  <div className={styles.bookingHeader}>
                    <div className={styles.bookingInfo}>
                      <h3 className={styles.vehicleName}>{booking.vehicle_name}</h3>
                      <p className={styles.bookingId}>Booking #{booking.id}</p>
                    </div>
                    {getStatusBadge(booking.start_date, booking.end_date)}
                  </div>

                  <div className={styles.bookingDetails}>
                    <div className={styles.detailRow}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>📅 Pickup</span>
                        <span className={styles.detailValue}>
                          {formatDate(booking.start_date)}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>📅 Return</span>
                        <span className={styles.detailValue}>
                          {formatDate(booking.end_date)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.detailRow}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>⏱️ Duration</span>
                        <span className={styles.detailValue}>{booking.days} days</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>💵 Total Price</span>
                        <span className={styles.detailValue}>
                          ${Number(booking.total_price).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.detailRow}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>👤 Name</span>
                        <span className={styles.detailValue}>{booking.customer_name}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>📞 Phone</span>
                        <span className={styles.detailValue}>{booking.customer_phone}</span>
                      </div>
                    </div>

                    <div className={styles.detailRow}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>📧 Email</span>
                        <span className={styles.detailValue}>{booking.customer_email}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>📅 Booked On</span>
                        <span className={styles.detailValue}>
                          {formatDate(booking.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.bookingActions}>
                    <Link
                      href={`/vehicles/${booking.vehicle_id}`}
                      className={styles.btnSecondary}
                    >
                      View Vehicle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
