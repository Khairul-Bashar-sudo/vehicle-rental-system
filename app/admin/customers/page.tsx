"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Customers.module.css";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        setError("Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to fetch customers");
    } finally {
      setLoading(false);
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm))
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
        <div className={styles.loading}>Loading customers...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Customers</h1>
          <p className={styles.subtitle}>
            Manage registered customers
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
            onClick={() => router.push("/admin/bookings")}
            className={styles.btnSecondary}
          >
            View Bookings
          </button>
          <button onClick={handleLogout} className={styles.btnSecondary}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{customers.length}</div>
          <div className={styles.statLabel}>Total Customers</div>
        </div>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className={styles.noData}>
          <p>No customers found.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableHeadCell}>Name</th>
                <th className={styles.tableHeadCell}>Email</th>
                <th className={styles.tableHeadCell}>Phone</th>
                <th className={styles.tableHeadCell}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className={styles.tableBodyRow}>
                  <td className={styles.tableBodyCell}>{customer.name}</td>
                  <td className={styles.tableBodyCell}>{customer.email}</td>
                  <td className={styles.tableBodyCell}>{customer.phone || "N/A"}</td>
                  <td className={styles.tableBodyCell}>{formatDate(customer.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
