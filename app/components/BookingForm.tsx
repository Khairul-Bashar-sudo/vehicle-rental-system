"use client";

import { useState, useEffect } from "react";
import CustomDatePicker, { DateRangeValue } from "./CustomDatePicker";
import styles from "./BookingForm.module.css";

interface BookingFormProps {
  vehicleId: string;
  vehicleName: string;
  pricePerDay: number;
}

interface AvailabilityInfo {
  available: boolean;
  totalQuantity: number;
  bookedCount: number;
  availableCount: number;
  message: string;
}

export default function BookingForm({ vehicleId, vehicleName, pricePerDay }: BookingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityInfo | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [dateHint, setDateHint] = useState<string | null>(
    "Select both a pick-up and return date to calculate availability."
  );
  const [datePickerKey, setDatePickerKey] = useState(0);

  // Calculate number of days and total price
  const calculateTotal = () => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const days = calculateTotal();
  const totalPrice = days * pricePerDay;
  const hasLimitedAvailability = Boolean(
    availability?.available &&
      typeof availability.availableCount === "number" &&
      typeof availability.totalQuantity === "number" &&
      availability.availableCount > 0 &&
      availability.availableCount < availability.totalQuantity
  );

  // Check availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!start || !end) {
        setAvailability(null);
        return;
      }

      if (new Date(start) >= new Date(end)) {
        setAvailability(null);
        return;
      }

      setIsCheckingAvailability(true);
      try {
        const response = await fetch(
          `/api/vehicles/${vehicleId}/availability?startDate=${start}&endDate=${end}`
        );
        const data = await response.json();
        
        if (response.ok) {
          setAvailability(data);
        } else {
          setAvailability(null);
        }
      } catch (error) {
        console.error('Error checking availability:', error);
        setAvailability(null);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [start, end, vehicleId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !phone || !start || !end) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (new Date(start) >= new Date(end)) {
      setMessage("End date must be after start date.");
      return;
    }

    if (days <= 0) {
      setMessage("Please select valid dates.");
      return;
    }

    // Check availability before submitting
    if (!availability || !availability.available) {
      setMessage("Selected dates are not available. Please choose different dates.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_id: vehicleId,
          vehicle_name: vehicleName,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          start_date: start,
          end_date: end,
          days: days,
          total_price: totalPrice,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`🎉 Success! Your booking for ${vehicleName} has been confirmed. Check your bookings page to see details.`);
        // Reset form
        setName("");
        setEmail("");
        setPhone("");
        setStart("");
        setEnd("");
        // Force date picker to remount and refresh availability
        setDatePickerKey(prev => prev + 1);
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to create booking. Please try again.'}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setMessage("❌ Failed to create booking. Please make sure you're logged in and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDateChange = ({ startDate, endDate }: DateRangeValue) => {
    setStart(startDate);
    setEnd(endDate);
    if (!startDate || !endDate) {
      setDateHint("Select both a pick-up and return date to calculate availability.");
    } else {
      setDateHint(null);
    }
  };

  return (
    <form className={styles.bookingForm} onSubmit={submit}>
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone" className={styles.label}>
          Phone Number *
        </label>
        <input
          id="phone"
          type="tel"
          className={styles.input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (234) 567-890"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          <span className={styles.calendarIcon}>📅</span> Rental Dates *
        </label>
        <CustomDatePicker
          key={datePickerKey}
          vehicleId={vehicleId}
          startDate={start}
          endDate={end}
          onChange={handleDateChange}
        />
        {dateHint && <p className={styles.dateHint}>{dateHint}</p>}
      </div>

      {/* Availability Status */}
      {start && end && new Date(start) < new Date(end) && (
        <div className={styles.availabilityStatus}>
          {isCheckingAvailability ? (
            <div className={styles.checkingAvailability}>
              <span className={styles.spinner}>⏳</span>
              <span>Checking availability...</span>
            </div>
          ) : availability ? (
            <div className={availability.available ? styles.availableStatus : styles.unavailableStatus}>
              <span className={styles.statusIcon}>
                {availability.available ? '✅' : '❌'}
              </span>
              <div className={styles.statusInfo}>
                <div className={styles.statusMessage}>{availability.message}</div>
                {availability.available && (
                  <div className={styles.statusDetails}>
                    {availability.availableCount} of {availability.totalQuantity} vehicle{availability.totalQuantity > 1 ? 's' : ''} available
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {days > 0 && (
        <div className={styles.priceSummary}>
          <div className={styles.summaryRow}>
            <span>Rental Duration</span>
            <span className={styles.summaryValue}>{days} day{days > 1 ? 's' : ''}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Daily Rate</span>
            <span className={styles.summaryValue}>${pricePerDay}</span>
          </div>
          <div className={styles.summaryTotal}>
            <span>Total Price</span>
            <span className={styles.totalValue}>${totalPrice}</span>
          </div>
        </div>
      )}

      <button 
        className={`${styles.submitButton} ${hasLimitedAvailability ? styles.limitedAvailability : ""}`} 
        type="submit"
        disabled={isSubmitting || !availability?.available || isCheckingAvailability}
      >
        {isSubmitting
          ? "Processing..."
          : !availability?.available && start && end
            ? "Not Available"
            : hasLimitedAvailability
              ? "Limited Availability"
              : "Book Now"}
      </button>

      {message && (
        <div className={message.includes("Success") ? styles.successMessage : styles.errorMessage}>
          {message}
        </div>
      )}
    </form>
  );
}
