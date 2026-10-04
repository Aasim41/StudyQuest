/**
 * JUET (Jaypee University of Engineering & Technology, Guna)
 * Official Academic Calendar - Odd Semester 2026 (A.Y. 2026-27)
 */

export const ACADEMIC_CALENDAR = {
  institution: "Jaypee University of Engineering & Technology, Guna",
  semester: "Odd Sem 2026",
  academicYear: "2026-2027",
  targetAttendance: 70, // Mandatory minimum requirement is 70%

  dates: {
    classesCommence: "2026-07-21",
    classesConclude: "2026-12-05",
    semesterClose: "2026-12-21",
  },

  // Single-day holidays for students
  holidays: [
    { date: "2026-08-15", name: "Independence Day", day: "Saturday" },
    { date: "2026-08-28", name: "Raksha Bandhan", day: "Friday" },
    { date: "2026-09-04", name: "Janmashtami", day: "Friday" },
    { date: "2026-10-02", name: "Mahatma Gandhi Jayanti", day: "Friday" },
    { date: "2026-10-20", name: "Dussehra", day: "Tuesday" },
    { date: "2026-11-08", name: "Deepawali", day: "Sunday" },
    { date: "2026-11-09", name: "Govardhan Pooja", day: "Monday" },
    { date: "2026-12-25", name: "Christmas Day", day: "Friday" },
  ],

  // Vacation ranges (no classes scheduled)
  vacations: [
    {
      name: "Mid Semester Break (Deepawali Vacation)",
      startDate: "2026-11-06",
      endDate: "2026-11-14",
    },
    {
      name: "Winter Vacation (Post T-3)",
      startDate: "2026-12-13",
      endDate: "2027-01-03",
    },
  ],

  // Examination and Fest periods with exact JUET class suspension rules
  events: [
    { name: "Test 1 (T-1)", startDate: "2026-08-24", endDate: "2026-08-29", classesSuspended: false, isExam: true },
    { name: "Practical Examinations 1 (P-1)", startDate: "2026-09-21", endDate: "2026-09-26", classesSuspended: false, isExam: true },
    { name: "Test 2 (T-2)", startDate: "2026-10-12", endDate: "2026-10-17", classesSuspended: true, isExam: true }, // Suspended
    { name: "Technical Fest (JYC)", startDate: "2026-10-29", endDate: "2026-10-31", classesSuspended: false, isDicey: true, note: "Classes are dicey/optional during Fest" },
    { name: "Makeup Test & P-2", startDate: "2026-11-30", endDate: "2026-12-05", classesSuspended: false, isExam: true, note: "Regular classes take place during makeup tests" }, // Classes take place!
    { name: "End Semester Examinations (T-3)", startDate: "2026-12-07", endDate: "2026-12-12", classesSuspended: true, isExam: true }, // Suspended
  ],

  /**
   * Helper to check if a given date string (YYYY-MM-DD) has classes suspended.
   * Classes are suspended during:
   * 1. Official holidays
   * 2. Vacations (Mid-sem Deepawali, Winter)
   * 3. T-2, T-3, and P-2
   */
  isClassSuspended(dateStr) {
    if (this.holidays.some(h => h.date === dateStr)) return { suspended: true, reason: "Holiday" };
    for (const v of this.vacations) {
      if (dateStr >= v.startDate && dateStr <= v.endDate) return { suspended: true, reason: v.name };
    }
    for (const e of this.events) {
      if (e.classesSuspended && dateStr >= e.startDate && dateStr <= e.endDate) {
        return { suspended: true, reason: e.name };
      }
    }
    return { suspended: false, reason: null };
  },

  /**
   * Helper to check if classes on this date are dicey (e.g. Technical Fest JYC)
   */
  isFestOrDicey(dateStr) {
    for (const e of this.events) {
      if (e.isDicey && dateStr >= e.startDate && dateStr <= e.endDate) {
        return { isDicey: true, reason: e.name, note: e.note };
      }
    }
    return { isDicey: false };
  }
};

export default ACADEMIC_CALENDAR;
