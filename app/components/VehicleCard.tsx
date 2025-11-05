import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "../../types/vehicle";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article className="vehicle-card">
      {vehicle.image ? (
        <div className="vehicle-image">
          <Image src={vehicle.image} alt={vehicle.name} width={360} height={200} />
        </div>
      ) : null}
      <div className="vehicle-body">
        <h3>{vehicle.name}</h3>
        <p className="muted">{vehicle.type} • {vehicle.seats} seats</p>
        <p className="price">${vehicle.pricePerDay}/day</p>
        <div className="card-actions">
          <Link href={`/vehicles/${vehicle.id}`} className="btn">View</Link>
        </div>
      </div>
    </article>
  );
}
