import { vehicles } from "../../data/vehicles";
import VehicleList from "../components/VehicleList";
import styles from "./Vehicles.module.css";

export const metadata = {
  title: "Our Fleet - DriveNow Vehicle Rentals",
  description: "Browse our wide selection of rental vehicles from sedans to luxury coupes",
};

export default function VehiclesPage() {
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
