import { Suspense } from "react";
import VehicleFilter from "./VehicleFilter";
import type { Vehicle } from "@/types/vehicle";

interface VehicleFilterWrapperProps {
  vehicles: Vehicle[];
  allVehicles: Vehicle[];
  currentFilters: {
    type?: string;
    minSeats?: string;
    maxPrice?: string;
    availability?: string;
    sortBy?: string;
  };
}

function FilterFallback() {
  return (
    <div style={{ padding: "32px 0", textAlign: "center" }}>
      <p>Loading filters...</p>
    </div>
  );
}

export default function VehicleFilterWrapper(props: VehicleFilterWrapperProps) {
  return (
    <Suspense fallback={<FilterFallback />}>
      <VehicleFilter {...props} />
    </Suspense>
  );
}
