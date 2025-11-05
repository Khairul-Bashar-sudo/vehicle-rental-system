import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.homepage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Your Journey Starts Here
          </h1>
          <p className={styles.heroSubtitle}>
            Premium vehicle rentals for every occasion. Experience comfort, reliability, and style on the road.
          </p>
          <div className={styles.heroCta}>
            <Link href="/vehicles" className={styles.btnPrimary}>
              Browse Vehicles
            </Link>
            <a href="#features" className={styles.btnSecondary}>
              Learn More
            </a>
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="/images/coupe.jpg"
            alt="Premium luxury vehicle"
            width={800}
            height={533}
            priority
            className={styles.heroImg}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>500+</div>
              <div className={styles.statLabel}>Vehicles Available</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>Happy Customers</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>24/7</div>
              <div className={styles.statLabel}>Customer Support</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>50+</div>
              <div className={styles.statLabel}>Locations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Choose Us</h2>
          <p className={styles.sectionSubtitle}>
            We provide the best vehicle rental experience with unmatched service
          </p>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🚗</div>
              <h3 className={styles.featureTitle}>Wide Selection</h3>
              <p className={styles.featureText}>
                From compact sedans to luxury coupes, find the perfect vehicle for your needs
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💰</div>
              <h3 className={styles.featureTitle}>Best Prices</h3>
              <p className={styles.featureText}>
                Competitive rates with no hidden fees. Quality service at affordable prices
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>Instant Booking</h3>
              <p className={styles.featureText}>
                Book in minutes with our streamlined process. Get on the road faster
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🛡️</div>
              <h3 className={styles.featureTitle}>Fully Insured</h3>
              <p className={styles.featureText}>
                All vehicles come with comprehensive insurance for your peace of mind
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔧</div>
              <h3 className={styles.featureTitle}>Well Maintained</h3>
              <p className={styles.featureText}>
                Regular servicing and inspections ensure reliability and safety
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📱</div>
              <h3 className={styles.featureTitle}>Easy Management</h3>
              <p className={styles.featureText}>
                Manage your bookings online with our user-friendly platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Categories */}
      <section className={styles.categories}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Popular Categories</h2>
          <p className={styles.sectionSubtitle}>
            Explore our diverse fleet of vehicles
          </p>
          <div className={styles.categoriesGrid}>
            <Link href="/vehicles" className={styles.categoryCard}>
              <Image
                src="/images/sedan.jpg"
                alt="Sedan"
                width={400}
                height={267}
                className={styles.categoryImage}
              />
              <div className={styles.categoryOverlay}>
                <h3>Sedans</h3>
                <p>Perfect for city driving</p>
              </div>
            </Link>
            <Link href="/vehicles" className={styles.categoryCard}>
              <Image
                src="/images/suv.jpg"
                alt="SUV"
                width={400}
                height={267}
                className={styles.categoryImage}
              />
              <div className={styles.categoryOverlay}>
                <h3>SUVs</h3>
                <p>Spacious family vehicles</p>
              </div>
            </Link>
            <Link href="/vehicles" className={styles.categoryCard}>
              <Image
                src="/images/van.jpg"
                alt="Van"
                width={400}
                height={267}
                className={styles.categoryImage}
              />
              <div className={styles.categoryOverlay}>
                <h3>Vans</h3>
                <p>Cargo and group travel</p>
              </div>
            </Link>
            <Link href="/vehicles" className={styles.categoryCard}>
              <Image
                src="/images/coupe.jpg"
                alt="Coupe"
                width={400}
                height={267}
                className={styles.categoryImage}
              />
              <div className={styles.categoryOverlay}>
                <h3>Luxury</h3>
                <p>Premium experience</p>
              </div>
            </Link>
            <Link href="/vehicles" className={styles.categoryCard}>
              <Image
                src="/images/kawasaki-ninja.jpg"
                alt="Motorcycle"
                width={400}
                height={267}
                className={styles.categoryImage}
              />
              <div className={styles.categoryOverlay}>
                <h3>Motorcycles</h3>
                <p>Thrill & adventure</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Hit the Road?</h2>
            <p className={styles.ctaText}>
              Browse our available vehicles and book your perfect ride today
            </p>
            <Link href="/vehicles" className={styles.btnCtaLarge}>
              View All Vehicles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
