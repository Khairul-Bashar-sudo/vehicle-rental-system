import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "../../types/vehicle";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article className="vehicle-card">
      {vehicle.image ? (
        <div className="vehicle-image">
          <Image src={vehicle.image} alt={vehicle.name} width={360} height={200} />
          {!vehicle.available && (
            <div className="unavailable-overlay">
              <span className="unavailable-badge">Unavailable</span>
            </div>
          )}
        </div>
      ) : null}
      <div className="vehicle-body">
        <h3>{vehicle.name}</h3>
        <p className="muted">{vehicle.type} • {vehicle.seats} seats</p>
        <p className="price">${vehicle.pricePerDay}/day</p>
        <div className="card-actions">
          <Link 
            href={`/vehicles/${vehicle.id}`} 
            className={vehicle.available ? "btn" : "btn btn-disabled"}
          >
            {vehicle.available ? "View Details" : "View (Unavailable)"}
          </Link>
        </div>
      </div>
    </article>
  );
}
