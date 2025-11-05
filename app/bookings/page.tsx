import Image from "next/image";
import Link from "next/link";
import styles from "./Bookings.module.css";

export const metadata = {
  title: "My Bookings - DriveNow",
  description: "View and manage your vehicle rental bookings",
};

// Mock booking data - In a real app, this would come from a database/API
const bookings = [
  {
    id: "BK001",
    vehicleId: "sedan-1",
    vehicleName: "Compact Sedan",
    vehicleImage: "/images/sedan.jpg",
    status: "confirmed",
    startDate: "2025-11-10",
    endDate: "2025-11-15",
    totalPrice: 225,
    pickupLocation: "Downtown Office",
    bookingDate: "2025-11-01",
  },
  {
    id: "BK002",
    vehicleId: "suv-1",
    vehicleName: "Family SUV",
    vehicleImage: "/images/suv.jpg",
    status: "active",
    startDate: "2025-11-04",
    endDate: "2025-11-07",
    totalPrice: 255,
    pickupLocation: "Airport Terminal 2",
    bookingDate: "2025-10-28",
  },
  {
    id: "BK003",
    vehicleId: "coupe-1",
    vehicleName: "Luxury Coupe",
    vehicleImage: "/images/coupe.jpg",
    status: "completed",
    startDate: "2025-10-15",
    endDate: "2025-10-18",
    totalPrice: 480,
    pickupLocation: "City Center",
    bookingDate: "2025-10-10",
  },
];

function getStatusBadge(status: string) {
  const statusStyles = {
    confirmed: styles.statusConfirmed,
    active: styles.statusActive,
    completed: styles.statusCompleted,
    cancelled: styles.statusCancelled,
  };

  const statusLabels = {
    confirmed: "Confirmed",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <span className={`${styles.statusBadge} ${statusStyles[status as keyof typeof statusStyles]}`}>
      {statusLabels[status as keyof typeof statusLabels]}
    </span>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

function calculateDays(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return days;
}

export default function BookingsPage() {
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
              <div className={styles.statValue}>
                {bookings.filter(b => b.status === 'confirmed').length}
              </div>
              <div className={styles.statLabel}>Upcoming</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🚗</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {bookings.filter(b => b.status === 'active').length}
              </div>
              <div className={styles.statLabel}>Active</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✓</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {bookings.filter(b => b.status === 'completed').length}
              </div>
              <div className={styles.statLabel}>Completed</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                ${bookings.reduce((sum, b) => sum + b.totalPrice, 0)}
              </div>
              <div className={styles.statLabel}>Total Spent</div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className={styles.bookingsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>All Bookings</h2>
            <Link href="/vehicles" className={styles.btnPrimary}>
              + New Booking
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <h3>No bookings yet</h3>
              <p>Start exploring our vehicle fleet and make your first booking!</p>
              <Link href="/vehicles" className={styles.btnPrimary}>
                Browse Vehicles
              </Link>
            </div>
          ) : (
            <div className={styles.bookingsList}>
              {bookings.map((booking) => (
                <div key={booking.id} className={styles.bookingCard}>
                  <div className={styles.bookingImage}>
                    <Image
                      src={booking.vehicleImage}
                      alt={booking.vehicleName}
                      width={200}
                      height={133}
                      className={styles.vehicleImg}
                    />
                  </div>
                  
                  <div className={styles.bookingContent}>
                    <div className={styles.bookingHeader}>
                      <div>
                        <div className={styles.bookingId}>Booking #{booking.id}</div>
                        <h3 className={styles.vehicleName}>{booking.vehicleName}</h3>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className={styles.bookingDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>📅</span>
                        <div>
                          <div className={styles.detailLabel}>Rental Period</div>
                          <div className={styles.detailValue}>
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                            <span className={styles.duration}>
                              ({calculateDays(booking.startDate, booking.endDate)} days)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>📍</span>
                        <div>
                          <div className={styles.detailLabel}>Pick-up Location</div>
                          <div className={styles.detailValue}>{booking.pickupLocation}</div>
                        </div>
                      </div>

                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>💰</span>
                        <div>
                          <div className={styles.detailLabel}>Total Price</div>
                          <div className={styles.detailValue}>${booking.totalPrice}</div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.bookingActions}>
                      <Link href={`/vehicles/${booking.vehicleId}`} className={styles.btnSecondary}>
                        View Vehicle
                      </Link>
                      {booking.status === 'confirmed' && (
                        <>
                          <button className={styles.btnSecondary}>Modify</button>
                          <button className={styles.btnCancel}>Cancel</button>
                        </>
                      )}
                      {booking.status === 'active' && (
                        <button className={styles.btnPrimary}>Extend Rental</button>
                      )}
                      {booking.status === 'completed' && (
                        <button className={styles.btnSecondary}>Book Again</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className={styles.helpSection}>
          <div className={styles.helpCard}>
            <h3 className={styles.helpTitle}>Need Help with Your Booking?</h3>
            <p className={styles.helpText}>
              Our support team is available 24/7 to assist you with any questions or modifications.
            </p>
            <div className={styles.helpActions}>
              <Link href="/contact" className={styles.btnPrimary}>
                Contact Support
              </Link>
              <a href="tel:+1234567890" className={styles.btnSecondary}>
                📞 Call Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
