import VehicleList from "../components/VehicleList";
import styles from "./Vehicles.module.css";
import type { Vehicle } from "@/types/vehicle";

export const metadata = {
  title: "Our Fleet - DriveNow Vehicle Rentals",
  description: "Browse our wide selection of rental vehicles from sedans to luxury coupes",
};

async function getVehicles(): Promise<Vehicle[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/vehicles`, {
      cache: 'no-store', // Always get fresh data
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch vehicles');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
}

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <main className={styles.vehiclesPage}>
      <div className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>Our Vehicle Fleet</h1>
          <p className={styles.subtitle}>
            Choose from our premium selection of vehicles. All vehicles are regularly maintained and fully insured.
          </p>
        </div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.filters}>
          <div className={styles.filterInfo}>
            <span className={styles.resultCount}>{vehicles.length} vehicles available</span>
          </div>
        </div>
        <VehicleList items={vehicles} />
      </div>
    </main>
  );
}
