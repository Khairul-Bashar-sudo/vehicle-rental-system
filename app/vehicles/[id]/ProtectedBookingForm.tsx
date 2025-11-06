"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import BookingForm from "@/app/components/BookingForm";
import styles from "./ProtectedBooking.module.css";

interface ProtectedBookingFormProps {
  vehicleName: string;
  pricePerDay: number;
  vehicleId: string;
}

export default function ProtectedBookingForm({
  vehicleName,
  pricePerDay,
  vehicleId,
}: ProtectedBookingFormProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.authRequired}>
        <div className={styles.authIcon}>🔐</div>
        <h3>Sign in Required</h3>
        <p>You need to sign in to book this vehicle</p>
        <div className={styles.authButtons}>
          <button
            onClick={() => router.push(`/login?callbackUrl=/vehicles/${vehicleId}`)}
            className={styles.btnPrimary}
          >
            Sign In
          </button>
          <button
            onClick={() => router.push(`/signup?callbackUrl=/vehicles/${vehicleId}`)}
            className={styles.btnSecondary}
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return <BookingForm vehicleName={vehicleName} pricePerDay={pricePerDay} vehicleId={vehicleId} />;
}
