/**
 * Utility functions for normalizing and comparing appointment dates.
 * Handles both ISO format ('YYYY-MM-DD') and relative textual strings ('Today', 'Tomorrow').
 */

export function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function normalizeAppointmentDate(dateStr?: string | null): string {
    if (!dateStr) return "";

    const clean = dateStr.trim().toLowerCase();
    const today = new Date();

    if (clean === "today") {
        return formatLocalDate(today);
    }

    if (clean === "tomorrow") {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return formatLocalDate(tomorrow);
    }

    if (clean === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return formatLocalDate(yesterday);
    }

    // Try parsing as standard date
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
        return formatLocalDate(parsed);
    }

    return dateStr;
}

export function isWithinDateRange(
    dateStr?: string | null,
    fromDate?: string | null,
    toDate?: string | null,
): boolean {
    if (!dateStr) return false;
    const normalized = normalizeAppointmentDate(dateStr);
    if (!normalized) return false;

    if (fromDate && normalized < fromDate) {
        return false;
    }
    if (toDate && normalized > toDate) {
        return false;
    }
    return true;
}

export function matchesDatePreset(
    dateStr?: string | null,
    preset: "all" | "today" | "tomorrow" | "this_week" | "this_month" | "past" = "all",
): boolean {
    if (preset === "all") return true;
    if (!dateStr) return false;

    const normalized = normalizeAppointmentDate(dateStr);
    if (!normalized) return false;

    const today = new Date();
    const todayStr = formatLocalDate(today);

    if (preset === "today") {
        return normalized === todayStr;
    }

    if (preset === "tomorrow") {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return normalized === formatLocalDate(tomorrow);
    }

    if (preset === "past") {
        return normalized < todayStr;
    }

    if (preset === "this_week") {
        // Monday to Sunday of the current week
        const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diffToMonday);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const startStr = formatLocalDate(monday);
        const endStr = formatLocalDate(sunday);

        return normalized >= startStr && normalized <= endStr;
    }

    if (preset === "this_month") {
        const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
        return normalized.startsWith(currentYearMonth);
    }

    return true;
}
