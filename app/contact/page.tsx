"use client";

import { useState } from "react";
import styles from "./Contact.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitMessage("Thank you for contacting us! We'll get back to you within 24 hours.");
      setIsSubmitting(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className={styles.contactPage}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>Get in Touch</h1>
          <p className={styles.subtitle}>
            Have questions? We&apos;re here to help 24/7
          </p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.contentGrid}>
          {/* Contact Information */}
          <div className={styles.infoSection}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>
            <p className={styles.infoText}>
              Fill out the form and our team will get back to you within 24 hours.
            </p>

            <div className={styles.contactMethods}>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>📞</div>
                <div className={styles.contactContent}>
                  <h3>Phone</h3>
                  <a href="tel:+1234567890">+1 (234) 567-890</a>
                  <p className={styles.contactHours}>Mon-Sun: 24/7</p>
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>✉️</div>
                <div className={styles.contactContent}>
                  <h3>Email</h3>
                  <a href="mailto:support@drivenow.com">support@drivenow.com</a>
                  <p className={styles.contactHours}>Response within 24h</p>
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>📍</div>
                <div className={styles.contactContent}>
                  <h3>Office</h3>
                  <p>123 Drive Street</p>
                  <p>New York, NY 10001</p>
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>💬</div>
                <div className={styles.contactContent}>
                  <h3>Live Chat</h3>
                  <p>Available 24/7</p>
                  <button className={styles.chatButton}>Start Chat</button>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className={styles.faqSection}>
              <h3 className={styles.faqTitle}>Quick Answers</h3>
              <div className={styles.faqList}>
                <details className={styles.faqItem}>
                  <summary>What documents do I need to rent a vehicle?</summary>
                  <p>You&apos;ll need a valid driver&apos;s license, a credit card in your name, and proof of insurance. For international customers, an International Driving Permit may be required.</p>
                </details>
                <details className={styles.faqItem}>
                  <summary>Can I modify or cancel my booking?</summary>
                  <p>Yes! You can modify or cancel your booking up to 24 hours before the pickup time for a full refund. Changes made within 24 hours may incur a fee.</p>
                </details>
                <details className={styles.faqItem}>
                  <summary>What&apos;s included in the rental price?</summary>
                  <p>Our rental prices include comprehensive insurance, unlimited mileage on rentals over 3 days, 24/7 roadside assistance, and free additional driver coverage.</p>
                </details>
                <details className={styles.faqItem}>
                  <summary>Do you offer long-term rentals?</summary>
                  <p>Absolutely! We offer special rates for weekly and monthly rentals. Contact us for a custom quote tailored to your needs.</p>
                </details>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.formSection}>
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Send us a Message</h2>
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (234) 567-890"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="booking">Booking Inquiry</option>
                    <option value="modification">Modify Booking</option>
                    <option value="cancellation">Cancellation</option>
                    <option value="billing">Billing Question</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>

                {submitMessage && (
                  <div className={styles.successMessage}>
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>

            {/* Business Hours */}
            <div className={styles.hoursCard}>
              <h3 className={styles.hoursTitle}>Business Hours</h3>
              <div className={styles.hoursList}>
                <div className={styles.hoursItem}>
                  <span>Monday - Friday</span>
                  <span className={styles.hoursTime}>24/7</span>
                </div>
                <div className={styles.hoursItem}>
                  <span>Saturday - Sunday</span>
                  <span className={styles.hoursTime}>24/7</span>
                </div>
                <div className={styles.hoursItem}>
                  <span>Holidays</span>
                  <span className={styles.hoursTime}>24/7</span>
                </div>
              </div>
              <p className={styles.hoursNote}>
                🎉 We&apos;re always open! Our team is available round the clock to assist you.
              </p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className={styles.mapSection}>
          <h2 className={styles.sectionTitle}>Our Locations</h2>
          <div className={styles.locationsGrid}>
            <div className={styles.locationCard}>
              <div className={styles.locationIcon}>🏢</div>
              <h3>Downtown Office</h3>
              <p>123 Drive Street</p>
              <p>New York, NY 10001</p>
              <a href="#" className={styles.directionsLink}>Get Directions →</a>
            </div>
            <div className={styles.locationCard}>
              <div className={styles.locationIcon}>✈️</div>
              <h3>Airport Terminal</h3>
              <p>JFK International Airport</p>
              <p>Terminal 2, Level 1</p>
              <a href="#" className={styles.directionsLink}>Get Directions →</a>
            </div>
            <div className={styles.locationCard}>
              <div className={styles.locationIcon}>🏙️</div>
              <h3>City Center</h3>
              <p>456 Main Boulevard</p>
              <p>New York, NY 10002</p>
              <a href="#" className={styles.directionsLink}>Get Directions →</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
