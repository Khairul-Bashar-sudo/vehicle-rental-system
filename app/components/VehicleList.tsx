import type { Vehicle } from "../../types/vehicle";
import VehicleCard from "./VehicleCard";

export default function VehicleList({ items }: { items: Vehicle[] }) {
  if (!items || items.length === 0) return <p>No vehicles available.</p>;

  return (
    <section className="vehicle-list">
      {items.map((v) => (
        <VehicleCard key={v.id} vehicle={v} />
      ))}
    </section>
  );
}
