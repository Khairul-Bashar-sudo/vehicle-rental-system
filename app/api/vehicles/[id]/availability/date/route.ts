import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { Vehicle } from "@/types/vehicle";

interface BookingCount {
	booked_count: number;
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const searchParams = request.nextUrl.searchParams;
		const dateParam = searchParams.get("date");

		if (!dateParam) {
			return NextResponse.json(
				{ error: "date query parameter is required" },
				{ status: 400 }
			);
		}

		const targetDate = new Date(dateParam);
		if (isNaN(targetDate.getTime())) {
			return NextResponse.json(
				{ error: "Invalid date format" },
				{ status: 400 }
			);
		}

		const normalizedDate = targetDate.toISOString().split("T")[0];

		const vehicles = await query<Vehicle[]>(
			"SELECT id, name, quantity, available FROM vehicles WHERE id = ?",
			[id]
		);

		if (vehicles.length === 0) {
			return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
		}

		const vehicle = vehicles[0];

		if (!vehicle.available) {
			const totalQuantity = vehicle.quantity || 1;
			return NextResponse.json({
				date: normalizedDate,
				available: false,
				totalQuantity,
				bookedCount: totalQuantity,
				availableCount: 0,
				message: "Vehicle is currently unavailable",
			});
		}

		const bookingCounts = await query<BookingCount[]>(
			`SELECT COUNT(*) AS booked_count
			 FROM bookings
			 WHERE vehicle_id = ?
				 AND start_date <= ?
				 AND end_date >= ?`,
			[id, normalizedDate, normalizedDate]
		);

		const bookedCount = bookingCounts[0]?.booked_count ?? 0;
		const totalQuantity = vehicle.quantity || 1;
		const availableCount = Math.max(totalQuantity - bookedCount, 0);
		const available = availableCount > 0;

		return NextResponse.json({
			date: normalizedDate,
			available,
			totalQuantity,
			bookedCount,
			availableCount,
			message: available
						? availableCount === totalQuantity
							? "All vehicles available"
							: `${availableCount} of ${totalQuantity} vehicle${totalQuantity > 1 ? "s" : ""} available`
				: "Fully booked on selected date",
		});
	} catch (error) {
		console.error("Error checking daily availability:", error);
		return NextResponse.json(
			{ error: "Failed to check daily availability" },
			{ status: 500 }
		);
	}
}
