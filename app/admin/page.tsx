"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Admin.module.css";

interface DbVehicle {
  id: string;
  name: string;
  type: string;
  seats: number;
  pricePerDay: number;
  image: string;
  description: string;
  available: boolean;
  quantity: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [vehicles, setVehicles] = useState<DbVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "",
    seats: "",
    pricePerDay: "",
    image: "",
    description: "",
    available: true,
    quantity: "1",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsAuthenticated(true);
      fetchVehicles();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("adminToken", data.token);
        setIsAuthenticated(true);
        fetchVehicles();
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles");
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch {
      console.error("Failed to fetch vehicles");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", imageFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imageUrl = formData.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      if (!imageUrl) {
        setError("Image is required");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          seats: parseInt(formData.seats),
          pricePerDay: parseFloat(formData.pricePerDay),
          quantity: parseInt(formData.quantity),
        }),
      });

      if (response.ok) {
        setSuccess("Vehicle added successfully!");
        await fetchVehicles();
        setFormData({
          id: "",
          name: "",
          type: "",
          seats: "",
          pricePerDay: "",
          image: "",
          description: "",
          available: true,
          quantity: "1",
        });
        setImageFile(null);
        setImagePreview("");
        setShowForm(false);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add vehicle");
      }
    } catch {
      setError("Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setLoading(true);
    setError("");

    try {
      let imageUrl = formData.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      const response = await fetch(`/api/vehicles/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          seats: parseInt(formData.seats),
          pricePerDay: parseFloat(formData.pricePerDay),
          quantity: parseInt(formData.quantity),
        }),
      });

      if (response.ok) {
        setSuccess("Vehicle updated successfully!");
        await fetchVehicles();
        setFormData({
          id: "",
          name: "",
          type: "",
          seats: "",
          pricePerDay: "",
          image: "",
          description: "",
          available: true,
          quantity: "1",
        });
        setImageFile(null);
        setImagePreview("");
        setEditingId(null);
        setShowForm(false);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update vehicle");
      }
    } catch {
      setError("Failed to update vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle: DbVehicle) => {
    setFormData({
      id: vehicle.id,
      name: vehicle.name,
      type: vehicle.type,
      seats: vehicle.seats.toString(),
      pricePerDay: vehicle.pricePerDay.toString(),
      image: vehicle.image,
      description: vehicle.description || "",
      available: vehicle.available,
      quantity: (vehicle.quantity || 1).toString(),
    });
    setImagePreview(vehicle.image);
    setImageFile(null);
    setEditingId(vehicle.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Vehicle deleted successfully!");
        await fetchVehicles();
      } else {
        setError("Failed to delete vehicle");
      }
    } catch {
      setError("Failed to delete vehicle");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <h1>Admin Login</h1>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
            {error && <p className={styles.error}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className={styles.btnPrimary}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <div className={styles.headerActions}>
          <button
            onClick={() => router.push("/admin/bookings")}
            className={styles.btnSecondary}
          >
            View Bookings
          </button>
          <button onClick={handleLogout} className={styles.btnSecondary}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}
      {success && <div className={styles.successBanner}>{success}</div>}

      <div className={styles.actions}>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setEditingId(null);
              setFormData({
                id: "",
                name: "",
                type: "",
                seats: "",
                pricePerDay: "",
                image: "",
                description: "",
                available: true,
                quantity: "1",
              });
              setImageFile(null);
              setImagePreview("");
            }
          }}
          className={styles.btnPrimary}
        >
          {showForm ? "Cancel" : "Add New Vehicle"}
        </button>
      </div>

      {showForm && (
        <div className={styles.formContainer}>
          <h2>{editingId ? "Edit Vehicle" : "Add New Vehicle"}</h2>
          <form
            onSubmit={editingId ? handleUpdateVehicle : handleAddVehicle}
            className={styles.vehicleForm}
          >
            <div className={styles.formGrid}>
              <label className={styles.formLabel}>
                Vehicle ID
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingId}
                  className={styles.formInput}
                  placeholder="e.g., sedan-1"
                />
                <small className={styles.helpText}>
                  Unique identifier (cannot be changed after creation)
                </small>
              </label>

              <label className={styles.formLabel}>
                Vehicle Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                  placeholder="e.g., Toyota Camry"
                />
              </label>

              <label className={styles.formLabel}>
                Type
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                >
                  <option value="">Select type</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>
              </label>

              <label className={styles.formLabel}>
                Seats
                <input
                  type="number"
                  name="seats"
                  value={formData.seats}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className={styles.formInput}
                />
              </label>

              <label className={styles.formLabel}>
                Quantity (Inventory)
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className={styles.formInput}
                />
              </label>

              <label className={styles.formLabel}>
                Price per Day ($)
                <input
                  type="number"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className={styles.formInput}
                />
              </label>

              <label className={styles.formLabel}>
                Vehicle Image
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className={styles.formInput}
                />
                <small className={styles.helpText}>
                  Upload an image (JPEG, PNG, WebP - Max 5MB)
                  {!editingId && " - Required for new vehicles"}
                </small>
              </label>

              {imagePreview && (
                <div className={styles.imagePreview}>
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}

              {formData.image && !imageFile && (
                <label className={styles.formLabel}>
                  Current Image URL
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="Or enter image URL manually"
                  />
                </label>
              )}

              <label className={styles.formLabel}>
                Description
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="e.g., Spacious SUV with room for luggage and family"
                />
              </label>

              <label className={styles.formLabel}>
                Available
                <select
                  name="available"
                  value={formData.available ? "true" : "false"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      available: e.target.value === "true",
                    }))
                  }
                  className={styles.formInput}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={loading || uploading}
              >
                {uploading
                  ? "Uploading..."
                  : loading
                  ? "Saving..."
                  : editingId
                  ? "Update Vehicle"
                  : "Add Vehicle"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    id: "",
                    name: "",
                    type: "",
                    seats: "",
                    pricePerDay: "",
                    image: "",
                    description: "",
                    available: true,
                    quantity: "1",
                  });
                  setImageFile(null);
                  setImagePreview("");
                }}
                className={styles.btnSecondary}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.vehiclesSection}>
        <h2>Vehicles</h2>
        {vehicles.length === 0 ? (
          <p>No vehicles found. Add some vehicles or initialize the database.</p>
        ) : (
          <div className={styles.vehiclesGrid}>
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className={styles.vehicleCard}>
                <div className={styles.vehicleImageContainer}>
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className={styles.vehicleImage}
                  />
                  <div className={styles.vehicleStatus}>
                    <span className={vehicle.available ? styles.badgeAvailable : styles.badgeUnavailable}>
                      {vehicle.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
                <div className={styles.vehicleCardContent}>
                  <h3 className={styles.vehicleName}>{vehicle.name}</h3>
                  <div className={styles.vehicleDetails}>
                    <div className={styles.vehicleDetailItem}>
                      <span className={styles.detailLabel}>Type:</span>
                      <span className={styles.detailValue}>{vehicle.type}</span>
                    </div>
                    <div className={styles.vehicleDetailItem}>
                      <span className={styles.detailLabel}>Seats:</span>
                      <span className={styles.detailValue}>{vehicle.seats}</span>
                    </div>
                    <div className={styles.vehicleDetailItem}>
                      <span className={styles.detailLabel}>Quantity:</span>
                      <span className={styles.detailValue}>{vehicle.quantity || 1}</span>
                    </div>
                    <div className={styles.vehicleDetailItem}>
                      <span className={styles.detailLabel}>ID:</span>
                      <span className={styles.detailValue}>{vehicle.id}</span>
                    </div>
                  </div>
                  <div className={styles.vehiclePrice}>
                    <span className={styles.priceLabel}>Price per day</span>
                    <span className={styles.priceValue}>${vehicle.pricePerDay}</span>
                  </div>
                  <div className={styles.vehicleActions}>
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className={styles.btnEdit}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className={styles.btnDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
