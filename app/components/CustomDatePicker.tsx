"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CustomDatePicker.module.css";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type AvailabilityState = "loading" | "available" | "unavailable";

type AvailabilityEntry = {
	state: AvailabilityState;
	availableCount?: number;
	totalQuantity?: number;
};

type CalendarDay = {
	date: Date;
	label: number;
	dateString: string;
	inCurrentMonth: boolean;
	isBeforeMin: boolean;
	isAfterMax: boolean;
};

export type DateRangeValue = {
	startDate: string;
	endDate: string;
};

type CustomDatePickerProps = {
	vehicleId: string;
	startDate: string;
	endDate: string;
	onChange: (value: DateRangeValue) => void;
	minDate?: string;
	maxMonthsAhead?: number;
};

type DailyAvailabilityResponse = {
	date: string;
	available: boolean;
	totalQuantity: number;
	bookedCount: number;
	availableCount: number;
	message?: string;
};

const startOfDay = (date: Date) =>
	new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatISODate = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const parseISODate = (value: string) => {
	if (!value) return null;
	const [year, month, day] = value.split("-").map((part) => parseInt(part, 10));
	if (!year || !month || !day) return null;
	return new Date(year, month - 1, day);
};

const buildCalendarDays = (
	currentMonth: Date,
	minDate: Date,
	maxDate: Date
): CalendarDay[] => {
	const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
	const firstWeekday = monthStart.getDay();
	const totalCells = 42; // 6 weeks grid

	const days: CalendarDay[] = [];
	for (let cell = 0; cell < totalCells; cell += 1) {
		const dayOffset = cell - firstWeekday;
		const cellDate = new Date(
			currentMonth.getFullYear(),
			currentMonth.getMonth(),
			1 + dayOffset
		);

		const normalizedDate = startOfDay(cellDate);
		days.push({
			date: normalizedDate,
			label: normalizedDate.getDate(),
			dateString: formatISODate(normalizedDate),
			inCurrentMonth: normalizedDate.getMonth() === currentMonth.getMonth(),
			isBeforeMin: normalizedDate < minDate,
			isAfterMax: normalizedDate > maxDate,
		});
	}

	return days;
};

const enumerateDates = (startDate: string, endDate: string) => {
	if (!startDate || !endDate) return [] as string[];
	const start = parseISODate(startDate);
	const end = parseISODate(endDate);
	if (!start || !end) return [];

	const forward = start <= end;
	const first = forward ? start : end;
	const last = forward ? end : start;

	const dates: string[] = [];
	let cursor = new Date(first);
	while (cursor <= last) {
		dates.push(formatISODate(cursor));
		cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
	}
	return dates;
};

const humanReadable = (value: string) => {
	if (!value) return "--";
	const parsed = parseISODate(value);
	if (!parsed) return "--";
	return parsed.toLocaleDateString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
};

const monthLabel = (value: Date) =>
	value.toLocaleDateString(undefined, { month: "long", year: "numeric" });

export default function CustomDatePicker({
	vehicleId,
	startDate,
	endDate,
	onChange,
	minDate,
	maxMonthsAhead = 6,
}: CustomDatePickerProps) {
	const today = useMemo(() => startOfDay(new Date()), []);
	const minBoundary = useMemo(() => {
		if (!minDate) return today;
		const parsed = parseISODate(minDate);
		return startOfDay(parsed ?? today);
	}, [minDate, today]);
	const monthsAhead = Math.max(maxMonthsAhead, 1);
	const maxBoundary = useMemo(
		() => startOfDay(new Date(minBoundary.getFullYear(), minBoundary.getMonth() + monthsAhead, 0)),
		[minBoundary, monthsAhead]
	);

	const [currentMonth, setCurrentMonth] = useState<Date>(
		() => new Date(minBoundary.getFullYear(), minBoundary.getMonth(), 1)
	);
	const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailabilityEntry>>({});
	const [hoverDate, setHoverDate] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<string | null>(null);

	const availabilityRef = useRef(availabilityMap);
	useEffect(() => {
		availabilityRef.current = availabilityMap;
	}, [availabilityMap]);

		useEffect(() => {
			setAvailabilityMap({});
			setHoverDate(null);
			setFeedback(null);
		}, [vehicleId]);

				useEffect(() => {
					setCurrentMonth((prev) => {
						const next = new Date(minBoundary.getFullYear(), minBoundary.getMonth(), 1);
						if (
							prev.getFullYear() === next.getFullYear() &&
							prev.getMonth() === next.getMonth()
						) {
							return prev;
						}
						return next;
					});
				}, [minBoundary, vehicleId]);

	const calendarDays = useMemo(
		() => buildCalendarDays(currentMonth, minBoundary, maxBoundary),
		[currentMonth, minBoundary, maxBoundary]
	);

	useEffect(() => {
		const known = availabilityRef.current;
		const missingDates = calendarDays
			.map((day) => day.dateString)
			.filter((date) => !known[date]);

		if (!missingDates.length) {
			return undefined;
		}

		setAvailabilityMap((prev) => {
			const next = { ...prev };
			missingDates.forEach((date) => {
				next[date] = { state: "loading" };
			});
			return next;
		});

		let cancelled = false;

		const fetchStatuses = async () => {
			const results = await Promise.all(
				missingDates.map(async (date) => {
					try {
									const response = await fetch(
										`/api/vehicles/${vehicleId}/availability/date?date=${date}`
									);
									const data: DailyAvailabilityResponse = await response.json();
									if (!response.ok) {
										throw new Error(data?.message || "Failed to fetch availability");
									}
						return { date, data };
					} catch (error) {
						console.error("Failed to fetch availability for", date, error);
						return { date, data: null } as { date: string; data: DailyAvailabilityResponse | null };
					}
				})
			);

			if (cancelled) return;

			setAvailabilityMap((prev) => {
				const next = { ...prev };
				results.forEach(({ date, data }) => {
					if (data) {
						next[date] = {
							state: data.available ? "available" : "unavailable",
							availableCount: data.availableCount,
							totalQuantity: data.totalQuantity,
						};
					} else {
						next[date] = { state: "unavailable" };
					}
				});
				return next;
			});
		};

		fetchStatuses();

		return () => {
			cancelled = true;
		};
	}, [calendarDays, vehicleId]);

	const normalizedStart = startDate || "";
	const normalizedEnd = endDate || "";

	const confirmRange = normalizedStart && normalizedEnd;

	const handleDayClick = (day: CalendarDay) => {
		if (day.isBeforeMin || day.isAfterMax) return;

		const status = availabilityMap[day.dateString];
			if (!status || status.state !== "available") {
				setFeedback("This date is fully booked. Please choose another day.");
			return;
		}

		setFeedback(null);

		if (!normalizedStart || (normalizedStart && normalizedEnd)) {
			setHoverDate(null);
			onChange({ startDate: day.dateString, endDate: "" });
			return;
		}

		if (day.dateString === normalizedStart) {
			setHoverDate(null);
			onChange({ startDate: normalizedStart, endDate: "" });
			return;
		}

		const startCandidate = day.dateString < normalizedStart ? day.dateString : normalizedStart;
		const endCandidate = day.dateString > normalizedStart ? day.dateString : normalizedStart;
		const rangeDates = enumerateDates(startCandidate, endCandidate);
		const hasBlocked = rangeDates.some(
			(date) => availabilityMap[date]?.state === "unavailable"
		);

		if (hasBlocked) {
			setFeedback("Your selected range contains fully booked dates. Please adjust your selection.");
			return;
		}

		setHoverDate(null);
		onChange({ startDate: startCandidate, endDate: endCandidate });
	};

	const handleHover = (day: CalendarDay | null) => {
		if (!normalizedStart || normalizedEnd) {
			setHoverDate(null);
			return;
		}

		if (!day || day.isBeforeMin || day.isAfterMax) {
			setHoverDate(null);
			return;
		}

		if (availabilityMap[day.dateString]?.state === "unavailable") {
			setHoverDate(null);
			return;
		}

		setHoverDate(day.dateString);
	};

	const clearSelection = () => {
		setHoverDate(null);
		onChange({ startDate: "", endDate: "" });
	};

	const isWithinConfirmedRange = (date: string) => {
		if (!confirmRange) return false;
		return date > normalizedStart && date < normalizedEnd;
	};

	const isWithinPreviewRange = (date: string) => {
		if (!normalizedStart || normalizedEnd || !hoverDate) return false;
		if (hoverDate > normalizedStart) {
			return date > normalizedStart && date < hoverDate;
		}
		if (hoverDate < normalizedStart) {
			return date < normalizedStart && date > hoverDate;
		}
		return false;
	};

	const canNavigatePrev = () => {
		const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
		const minMonth = new Date(minBoundary.getFullYear(), minBoundary.getMonth(), 1);
		return prevMonth >= minMonth;
	};

	const canNavigateNext = () => {
		const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
		const maxMonth = new Date(maxBoundary.getFullYear(), maxBoundary.getMonth(), 1);
		return nextMonth <= maxMonth;
	};

	const goToPreviousMonth = () => {
		if (!canNavigatePrev()) return;
		setCurrentMonth(
			(prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
		);
	};

	const goToNextMonth = () => {
		if (!canNavigateNext()) return;
		setCurrentMonth(
			(prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
		);
	};

	const rentalDays = useMemo(() => {
		if (!confirmRange) return 0;
		const start = parseISODate(normalizedStart);
		const end = parseISODate(normalizedEnd);
		if (!start || !end) return 0;
		const diffMs = end.getTime() - start.getTime();
		return diffMs > 0 ? Math.round(diffMs / (1000 * 60 * 60 * 24)) : 0;
	}, [confirmRange, normalizedStart, normalizedEnd]);

	return (
		<div className={styles.datePicker}>
			<div className={styles.headerRow}>
				<div>
					<div className={styles.headerLabel}>Choose your rental dates</div>
					<div className={styles.monthLabel}>{monthLabel(currentMonth)}</div>
				</div>
				<div className={styles.navGroup}>
					<button
						type="button"
						onClick={goToPreviousMonth}
						className={styles.navButton}
						disabled={!canNavigatePrev()}
						aria-label="Previous month"
					>
						←
					</button>
					<button
						type="button"
						onClick={goToNextMonth}
						className={styles.navButton}
						disabled={!canNavigateNext()}
						aria-label="Next month"
					>
						→
					</button>
				</div>
			</div>

			<div className={styles.legend}>
				<div className={styles.legendItem}>
					<span className={`${styles.legendDot} ${styles.legendAvailable}`}></span>
					Available
				</div>
				<div className={styles.legendItem}>
					<span className={`${styles.legendDot} ${styles.legendUnavailable}`}></span>
					Fully booked
				</div>
				<div className={styles.legendItem}>
					<span className={`${styles.legendDot} ${styles.legendSelected}`}></span>
					Selected
				</div>
			</div>

			<div className={styles.calendarGrid}>
				<div className={styles.weekRow}>
					{WEEK_DAYS.map((day) => (
						<div key={day} className={styles.weekDay}>
							{day}
						</div>
					))}
				</div>
				<div className={styles.daysGrid}>
					{calendarDays.map((day) => {
						const status = availabilityMap[day.dateString];
						const isSelectedEdge =
							day.dateString === normalizedStart || day.dateString === normalizedEnd;
									const isDisabled =
										day.isBeforeMin ||
										day.isAfterMax ||
										!status ||
										status.state === "unavailable" ||
										status.state === "loading";

						const classes = [styles.dayButton];
						if (!day.inCurrentMonth) classes.push(styles.outsideDay);
						if (status?.state === "available") classes.push(styles.availableDay);
						if (status?.state === "unavailable") classes.push(styles.unavailableDay);
						if (status?.state === "loading") classes.push(styles.loadingDay);
						if (isWithinConfirmedRange(day.dateString)) classes.push(styles.inRangeDay);
						if (isWithinPreviewRange(day.dateString)) classes.push(styles.previewRangeDay);
						if (isSelectedEdge) classes.push(styles.selectedEdge);
						if (isDisabled) classes.push(styles.disabledDay);

									return (
							<button
								key={day.dateString}
								type="button"
								className={classes.join(" ")}
															disabled={
																day.isBeforeMin ||
																day.isAfterMax ||
																!status ||
																status.state === "unavailable" ||
																status.state === "loading"
															}
								onClick={() => handleDayClick(day)}
								onMouseEnter={() => handleHover(day)}
								onMouseLeave={() => handleHover(null)}
								aria-pressed={isSelectedEdge || isWithinConfirmedRange(day.dateString)}
							>
								<span>{day.label}</span>
							</button>
						);
					})}
				</div>
			</div>

			<div className={styles.selectionSummary}>
				<div>
					<span className={styles.summaryLabel}>Pick-up</span>
					<span className={styles.summaryValue}>{humanReadable(normalizedStart)}</span>
				</div>
				<div>
					<span className={styles.summaryLabel}>Return</span>
					<span className={styles.summaryValue}>{humanReadable(normalizedEnd)}</span>
				</div>
				<div>
					<span className={styles.summaryLabel}>Duration</span>
					<span className={styles.summaryValue}>
						{rentalDays > 0 ? `${rentalDays} day${rentalDays > 1 ? "s" : ""}` : "--"}
					</span>
				</div>
				<div>
					<button
						type="button"
						className={styles.clearButton}
						onClick={clearSelection}
						disabled={!normalizedStart && !normalizedEnd}
					>
						Clear
					</button>
				</div>
			</div>

			{feedback && <div className={styles.feedback}>{feedback}</div>}
		</div>
	);
}
