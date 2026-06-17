"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Bookings.module.css";

interface Booking {
  id: number;
  vehicle_id: string;
  vehicle_name: string;
  user_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  days: number;
  total_price: number;
  created_at: string;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
      return;
    }

    setIsAuthenticated(true);
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/bookings");
      if (response.ok) {
        const data = await response.json();
        console.log("Bookings fetched:", data);
        setBookings(data);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch bookings:", response.status, errorText);
        setError("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const response = await fetch(`/api/admin/bookings?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Booking deleted successfully!");
        await fetchBookings();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorText = await response.text();
        console.error("Failed to delete booking:", response.status, errorText);
        setError("Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      setError("Failed to delete booking");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_phone.includes(searchTerm)
  );

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + Number(booking.total_price),
    0
  );

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Redirecting to login...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Bookings Dashboard</h1>
          <p className={styles.subtitle}>
            Manage all vehicle rental bookings
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => router.push("/admin")}
            className={styles.btnSecondary}
          >
            Manage Vehicles
          </button>
          <button
            onClick={() => router.push("/admin/customers")}
            className={styles.btnSecondary}
          >
            Customers
          </button>
          <button onClick={handleLogout} className={styles.btnSecondary}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}
      {success && <div className={styles.successBanner}>{success}</div>}

      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{bookings.length}</div>
          <div className={styles.statLabel}>Total Bookings</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            ${totalRevenue.toLocaleString()}
          </div>
          <div className={styles.statLabel}>Total Revenue</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {
              bookings.filter(
                (b) => new Date(b.end_date) >= new Date()
              ).length
            }
          </div>
          <div className={styles.statLabel}>Active Bookings</div>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by customer name, email, phone, or vehicle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableContainer}>
        {filteredBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <p>
              {searchTerm
                ? "No bookings found matching your search."
                : "No bookings yet."}
            </p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Total</th>
                <th>Booked On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td className={styles.vehicleName}>{booking.vehicle_name}</td>
                  <td>{booking.customer_name}</td>
                  <td>
                    <div className={styles.contactInfo}>
                      <div>{booking.customer_email}</div>
                      <div className={styles.phone}>
                        {booking.customer_phone}
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(booking.start_date)}</td>
                  <td>{formatDate(booking.end_date)}</td>
                  <td>{booking.days}</td>
                  <td className={styles.price}>
                    ${Number(booking.total_price).toFixed(2)}
                  </td>
                  <td>{formatDate(booking.created_at)}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className={styles.btnDelete}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
