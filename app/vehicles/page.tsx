import VehicleFilterWrapper from "../components/VehicleFilterWrapper";
import styles from "./Vehicles.module.css";
import type { Vehicle } from "@/types/vehicle";

export const metadata = {
  title: "Our Fleet - DriveNow Vehicle Rentals",
  description: "Browse our wide selection of rental vehicles from sedans to luxury coupes",
};

interface VehiclesPageProps {
  searchParams: Promise<{
    type?: string;
    minSeats?: string;
    maxPrice?: string;
    availability?: string;
    sortBy?: string;
  }>;
}

async function getVehicles(searchParams: {
  type?: string;
  minSeats?: string;
  maxPrice?: string;
  availability?: string;
  sortBy?: string;
}): Promise<{ vehicles: Vehicle[], allVehicles: Vehicle[] }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Get all vehicles for filter options
    const allVehiclesRes = await fetch(`${baseUrl}/api/vehicles`, {
      cache: 'no-store',
    });
    const allVehicles = allVehiclesRes.ok ? await allVehiclesRes.json() : [];

    // Build query string for filtered vehicles
    const params = new URLSearchParams();
    if (searchParams.type) params.set('type', searchParams.type);
    if (searchParams.minSeats) params.set('minSeats', searchParams.minSeats);
    if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
    if (searchParams.availability) params.set('availability', searchParams.availability);
    if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy);

    const queryString = params.toString();
    const url = `${baseUrl}/api/vehicles${queryString ? `?${queryString}` : ''}`;
    
    const res = await fetch(url, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch vehicles');
    }
    
    const vehicles = await res.json();
    return { vehicles, allVehicles };
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return { vehicles: [], allVehicles: [] };
  }
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const params = await searchParams;
  const { vehicles, allVehicles } = await getVehicles(params);

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
        <VehicleFilterWrapper 
          vehicles={vehicles} 
          allVehicles={allVehicles}
          currentFilters={params}
        />
      </div>
    </main>
  );
}
