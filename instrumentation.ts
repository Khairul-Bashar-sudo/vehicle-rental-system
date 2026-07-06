export async function register() {
  const { initializeDatabase, seedVehicles } = await import('@/lib/db');
  await initializeDatabase();
  await seedVehicles();
}
