import BookingForm from "../../components/BookingForm";
import ProtectedBookingForm from "./ProtectedBookingForm";
import Image from "next/image";
import Link from "next/link";
import styles from "./VehicleDetail.module.css";
import type { Vehicle } from "@/types/vehicle";

type Props = {
  params: Promise<{ id: string }>;
};

async function getVehicle(id: string): Promise<Vehicle | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/vehicles/${id}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  return {
    title: vehicle ? `${vehicle.name} • DriveNow` : "Vehicle",
  };
}

export default async function VehiclePage({ params }: Props) {
  const { id } = await params;
  const vehicle = await getVehicle(id);

  if (!vehicle) {
    return (
      <main className={styles.notFound}>
        <div className={styles.notFoundContent}>
          <h2>🚗 Vehicle not found</h2>
          <p>We couldn&apos;t find the vehicle you were looking for.</p>
          <Link href="/vehicles" className={styles.btnBack}>
            ← Back to Vehicles
          </Link>
        </div>
      </main>
    );
  }

  // Calculate some example benefits
  const features = [
    { icon: "👤", label: `${vehicle.seats} Seats`, description: "Comfortable seating" },
    { icon: "⚙️", label: "Automatic", description: "Easy to drive" },
    { icon: "❄️", label: "Air Conditioning", description: "Climate control" },
    { icon: "🎵", label: "Bluetooth", description: "Audio system" },
    { icon: "🛡️", label: "Insurance", description: "Fully covered" },
    { icon: "🔋", label: "Fuel Efficient", description: "Save on gas" },
  ];

  const policies = [
    "Valid driver's license required",
    "Minimum age: 21 years old",
    "Security deposit may apply",
    "Free cancellation up to 24 hours before pickup",
    "Unlimited mileage on rentals over 3 days",
  ];

  return (
    <main className={styles.vehicleDetail}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={styles.container}>
          <Link href="/">Home</Link>
          <span className={styles.separator}>›</span>
          <Link href="/vehicles">Vehicles</Link>
          <span className={styles.separator}>›</span>
          <span>{vehicle.name}</span>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.detailGrid}>
          {/* Left Column - Images and Details */}
          <div className={styles.mainContent}>
            {/* Vehicle Image */}
            <div className={styles.imageWrapper}>
              {vehicle.image ? (
                <Image 
                  src={vehicle.image} 
                  alt={vehicle.name} 
                  width={800} 
                  height={533}
                  className={styles.vehicleImage}
                  priority
                />
              ) : null}
              <div className={styles.availabilityBadge}>
                {vehicle.available ? (
                  <span className={styles.available}>✓ Available</span>
                ) : (
                  <span className={styles.unavailable}>✗ Unavailable</span>
                )}
              </div>
            </div>

            {/* Vehicle Info */}
            <div className={styles.vehicleInfo}>
              <div className={styles.header}>
                <div>
                  <span className={styles.vehicleType}>{vehicle.type}</span>
                  <h1 className={styles.vehicleName}>{vehicle.name}</h1>
                </div>
                <div className={styles.priceTag}>
                  <span className={styles.priceAmount}>${vehicle.pricePerDay}</span>
                  <span className={styles.priceLabel}>per day</span>
                </div>
              </div>

              <p className={styles.description}>{vehicle.description}</p>

              {/* Features Grid */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Vehicle Features</h2>
                <div className={styles.featuresGrid}>
                  {features.map((feature, index) => (
                    <div key={index} className={styles.featureItem}>
                      <span className={styles.featureIcon}>{feature.icon}</span>
                      <div className={styles.featureContent}>
                        <div className={styles.featureLabel}>{feature.label}</div>
                        <div className={styles.featureDescription}>{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rental Policies */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Rental Policies</h2>
                <ul className={styles.policiesList}>
                  {policies.map((policy, index) => (
                    <li key={index} className={styles.policyItem}>
                      <span className={styles.checkIcon}>✓</span>
                      {policy}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Why Choose Us */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Why Book With Us?</h2>
                <div className={styles.benefits}>
                  <div className={styles.benefitItem}>
                    <span className={styles.benefitIcon}>💰</span>
                    <div>
                      <h3>Best Price Guarantee</h3>
                      <p>Competitive rates with no hidden fees</p>
                    </div>
                  </div>
                  <div className={styles.benefitItem}>
                    <span className={styles.benefitIcon}>⚡</span>
                    <div>
                      <h3>Instant Confirmation</h3>
                      <p>Get confirmation within minutes</p>
                    </div>
                  </div>
                  <div className={styles.benefitItem}>
                    <span className={styles.benefitIcon}>🛡️</span>
                    <div>
                      <h3>Fully Insured</h3>
                      <p>Comprehensive coverage included</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form (Sticky) */}
          <div className={styles.sidebar}>
            <div className={styles.bookingCard}>
              <h3 className={styles.bookingTitle}>Book This Vehicle</h3>
              <div className={styles.bookingSummary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Daily Rate</span>
                  <span className={styles.summaryValue}>${vehicle.pricePerDay}</span>
                </div>
              </div>
              <ProtectedBookingForm
                vehicleId={vehicle.id}
                vehicleName={vehicle.name}
                pricePerDay={vehicle.pricePerDay}
              />
            </div>

            {/* Support Card */}
            <div className={styles.supportCard}>
              <h3 className={styles.supportTitle}>Need Help?</h3>
              <p className={styles.supportText}>
                Our team is available 24/7 to assist you with your booking.
              </p>
              <a href="tel:+1234567890" className={styles.supportLink}>
                📞 Call: +1 (234) 567-890
              </a>
              <a href="mailto:support@drivenow.com" className={styles.supportLink}>
                ✉️ Email: support@drivenow.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
