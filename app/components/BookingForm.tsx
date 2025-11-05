"use client";

import { useState } from "react";
import styles from "./BookingForm.module.css";

interface BookingFormProps {
  vehicleId: string;
  vehicleName: string;
  pricePerDay: number;
}

export default function BookingForm({ vehicleName, pricePerDay }: BookingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  function submit(e: React.FormEvent) {
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

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setMessage(`🎉 Success! Your booking request for ${vehicleName} has been received. We'll contact you at ${email} shortly.`);
      setIsSubmitting(false);
    }, 1000);
  }

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

      <div className={styles.dateGroup}>
        <div className={styles.formGroup}>
          <label htmlFor="start" className={styles.label}>
            <span className={styles.calendarIcon}>📅</span> Pick-up Date *
          </label>
          <input
            id="start"
            type="date"
            className={`${styles.input} ${styles.dateInput}`}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="end" className={styles.label}>
            <span className={styles.calendarIcon}>📅</span> Return Date *
          </label>
          <input
            id="end"
            type="date"
            className={`${styles.input} ${styles.dateInput}`}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            min={start || new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

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
        className={styles.submitButton} 
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Book Now"}
      </button>

      {message && (
        <div className={message.includes("Success") ? styles.successMessage : styles.errorMessage}>
          {message}
        </div>
      )}
    </form>
  );
}
