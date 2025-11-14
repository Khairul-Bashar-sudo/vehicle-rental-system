"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Vehicle } from "@/types/vehicle";
import VehicleList from "./VehicleList";
import styles from "./VehicleFilter.module.css";

interface VehicleFilterProps {
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

export default function VehicleFilter({ vehicles, allVehicles, currentFilters }: VehicleFilterProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  // Get max price for slider from all vehicles
  const maxVehiclePrice = useMemo(() => {
    if (!allVehicles || allVehicles.length === 0) return 1000;
    const maxPrice = Math.max(...allVehicles.map((v) => v.pricePerDay), 100);
    return maxPrice;
  }, [allVehicles]);

  // Initialize filters from URL params
  const filters = useMemo(() => ({
    type: currentFilters.type || "all",
    minSeats: parseInt(currentFilters.minSeats || "0"),
    maxPrice: currentFilters.maxPrice ? parseInt(currentFilters.maxPrice) : maxVehiclePrice,
    availability: currentFilters.availability || "all",
    sortBy: currentFilters.sortBy || "name",
  }), [currentFilters, maxVehiclePrice]);

  // Get unique vehicle types from all vehicles
  const vehicleTypes = useMemo(() => {
    if (!allVehicles || allVehicles.length === 0) return [];
    const types = new Set(allVehicles.map((v) => v.type));
    return Array.from(types).sort();
  }, [allVehicles]);

  // Update URL with new filters
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    console.log("Updating filters:", newFilters);
    const params = new URLSearchParams(window.location.search);
    
    // Update only the changed filters while preserving existing ones
    Object.entries(newFilters).forEach(([key, value]) => {
      if (key === 'type') {
        if (value && value !== "all") {
          params.set("type", value as string);
        } else {
          params.delete("type");
        }
      } else if (key === 'minSeats') {
        const numValue = typeof value === 'number' ? value : 0;
        if (numValue > 0) {
          params.set("minSeats", numValue.toString());
        } else {
          params.delete("minSeats");
        }
      } else if (key === 'maxPrice') {
        const numValue = typeof value === 'number' ? value : maxVehiclePrice;
        if (numValue < maxVehiclePrice) {
          params.set("maxPrice", numValue.toString());
        } else {
          params.delete("maxPrice");
        }
      } else if (key === 'availability') {
        if (value && value !== "all") {
          params.set("availability", value as string);
        } else {
          params.delete("availability");
        }
      } else if (key === 'sortBy') {
        if (value && value !== "name") {
          params.set("sortBy", value as string);
        } else {
          params.delete("sortBy");
        }
      }
    });

    // Navigate with new parameters
    const queryString = params.toString();
    const newUrl = `/vehicles${queryString ? `?${queryString}` : ''}`;
    console.log("Navigating to:", newUrl);
    router.push(newUrl, { scroll: false });
  };

  const resetFilters = () => {
    router.push("/vehicles");
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type !== "all") count++;
    if (filters.minSeats > 0) count++;
    if (filters.maxPrice < maxVehiclePrice) count++;
    if (filters.availability !== "all") count++;
    return count;
  }, [filters, maxVehiclePrice]);

  return (
    <>
      <div className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <div className={styles.filterInfo}>
            <span className={styles.resultCount}>
              {vehicles.length} of {allVehicles.length} vehicles
            </span>
            {activeFilterCount > 0 && (
              <span className={styles.activeFilters}>
                {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
              </span>
            )}
          </div>
          <div className={styles.filterActions}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={styles.btnFilter}
            >
              <span>🔍</span>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className={styles.btnReset}>
                Clear All
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGrid}>
              {/* Type Filter */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Vehicle Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => updateFilters({ type: e.target.value })}
                  className={styles.filterSelect}
                >
                  <option value="all">All Types</option>
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seats Filter */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  Minimum Seats: {filters.minSeats || "Any"}
                </label>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={filters.minSeats}
                  onChange={(e) =>
                    updateFilters({ minSeats: parseInt(e.target.value) })
                  }
                  className={styles.filterRange}
                />
                <div className={styles.rangeLabels}>
                  <span>Any</span>
                  <span>2</span>
                  <span>4</span>
                  <span>6</span>
                  <span>8</span>
                </div>
              </div>

              {/* Price Filter */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  Max Price: ${filters.maxPrice}/day
                </label>
                <input
                  type="range"
                  min="0"
                  max={maxVehiclePrice}
                  step="10"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    updateFilters({ maxPrice: parseInt(e.target.value) })
                  }
                  className={styles.filterRange}
                />
                <div className={styles.rangeLabels}>
                  <span>$0</span>
                  <span>${Math.floor(maxVehiclePrice / 2)}</span>
                  <span>${maxVehiclePrice}</span>
                </div>
              </div>

              {/* Availability Filter */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Availability</label>
                <select
                  value={filters.availability}
                  onChange={(e) => updateFilters({ availability: e.target.value })}
                  className={styles.filterSelect}
                >
                  <option value="all">All Vehicles</option>
                  <option value="available">Available Only</option>
                  <option value="unavailable">Unavailable Only</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value })}
                  className={styles.filterSelect}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="seats-low">Seats (Low to High)</option>
                  <option value="seats-high">Seats (High to Low)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {vehicles.length === 0 ? (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>🚗</div>
          <h3>No vehicles found</h3>
          <p>Try adjusting your filters to see more results</p>
          <button onClick={resetFilters} className={styles.btnPrimary}>
            Reset Filters
          </button>
        </div>
      ) : (
        <VehicleList items={vehicles} />
      )}
    </>
  );
}
