# Research: Scheduled Todos Implementation

**Completed**: 2026-05-12  
**Status**: All clarifications resolved, decisions documented

## Research Question 1: Date Handling in SolidJS Reactive Framework

**Clarification Needed**: Best practices for date handling—native Date objects, external date library, or ISO strings?

### Investigation

1. **Native Date Objects**: JS engine optimized, zero dependencies, but timezone handling is implicit (uses device timezone).
2. **Date Libraries** (date-fns, dayjs): Well-documented, timezone-safe, but adds bundle weight (15-30KB min+gzip).
3. **ISO 8601 Strings**: Human-readable storage, standard format, but require parsing/comparison logic.

### Decision

**Use Native Date Objects + ISO 8601 String Storage**

**Rationale**:

- SolidJS Constitution prioritizes **Program Efficiency**: "Dependencies MUST be hand-picked and justified."
- Existing app has zero date dependencies; adding one for scheduled todos would violate efficiency principle.
- Native Date objects are performant for comparisons (millisecond-level precision unnecessary for day-only scheduling).
- ISO 8601 strings in localStorage provide human-readable debugging (can inspect in DevTools without decoding).

**Implementation Contract**:

- Store: ISO 8601 format (`new Date(2026, 4, 15).toISOString()` → `"2026-05-15T00:00:00.000Z"`)
- Compare: Parse to Date, use `getFullYear() + getMonth() + getDate()` for day-level comparison
- Display: `date.toLocaleDateString(locale)` for user-facing text

**Alternatives Rejected**:

- date-fns: Bundle size not justified; native Date sufficient for day-only comparisons.
- Moment.js: Deprecated; even maintainers recommend alternatives. Overkill for this feature.
- Manual string manipulation: Error-prone; native Date handles leap years, timezone, DST correctly.

---

## Research Question 2: localStorage Quota and Scaled Todo Storage

**Clarification Needed**: Will adding scheduledDate/completedAt/isOverdue fields exceed 5MB localStorage limit?

### Investigation

Per spec assumption, 5MB localStorage quota limit. Calculate size impact:

1. **Baseline Todo (5 fields)**: ~100 bytes per todo (avg 50-char title, id, description).
   - Example: `{"id":"1","title":"Sample","desc":"","completed":false,"createdAt":"2026-01-01T00:00Z"}`
   - Size: ~85 bytes (minified JSON)

2. **Extended Todo (8 fields, +3 new)**: ~140 bytes per todo.
   - Added: `scheduledDate`, `completedAt`, `isOverdue` (~40 bytes additional, ISO dates are verbose)
   - Example: `{"id":"1",...,"scheduledDate":"2026-05-15T00:00Z","completedAt":"2026-05-16T14:32Z","isOverdue":false}`
   - Size: ~130 bytes

3. **Scale**: At 500 todos (reasonable limit for UI performance), ~65KB total (minimal relative to 5MB quota).
   - At 50,000 todos (unrealistic for single-user UI), ~6.5MB (approaches limit, but UI would be unusable).

### Decision

**No Storage Changes Required**

**Rationale**:

- New fields add ~45 bytes per todo.
- 1000 todos = ~45KB (0.9% of 5MB quota).
- Impact negligible; quota exceeded only if user has 50k+ todos (UI/performance constraints hit first).
- Existing app already handles localStorage quota exceeded errors (per Constitution: "localStorage failures...MUST be gracefully handled").

**Monitoring**:

- No change required to existing quota handling.
- If feature adds 100+ todos per session, monitor telemetry (not in scope for v1).

**Alternatives Rejected**:

- Compression: Adds complexity; JSON minification is implicit in localStorage.
- Archival system: Out of scope (spec does not require todo archival or cleanup).
- IndexedDB migration: Premature optimization; localStorage sufficient for this scale.

---

## Research Question 3: Browser Date API Edge Cases and Timezone Handling

**Clarification Needed**: How do we handle timezone differences, DST, system clock changes?

### Investigation

1. **Timezone handling**: JavaScript Date uses device timezone implicitly. `new Date(2026, 4, 15)` creates midnight in device timezone.
2. **DST transitions**: Date object handles DST automatically (no special logic needed).
3. **System clock changes**: If user backdates system clock after todo is scheduled, comparison uses new system time (not a security issue for single-user app).
4. **Cross-browser consistency**: Date API is stable across all modern browsers (ES5 standard).

### Decision

**Use Device Timezone with Day-Only Normalization**

**Rationale**:

- Spec assumption: "The system uses the user's local device timezone for all date comparisons."
- Day-only scheduling (no time component) eliminates 90% of edge cases.
- User expectation: "Schedule for tomorrow" = "tomorrow in my timezone, anytime during that day."
- Normalization to midnight: `new Date(year, month, day, 0, 0, 0, 0).toISOString()` ensures consistent comparisons.

**Edge Cases Handled**:

| Edge Case                                           | Handling                                                                                                                                      | Example                                                                                                                               |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Schedule for far future (1 year)                    | No limit; Date API supports up to ±271821 years                                                                                               | Schedule for May 2027, app works                                                                                                      |
| Timezone travel (schedule for "tomorrow", fly east) | Uses device timezone at time of scheduling. If user travels and system date advances, todo is still "tomorrow" relative to their new location | Schedule May 15 in NY, travel to London May 14 evening: todo still shows May 15; can't complete until May 15 London time              |
| System clock backdated                              | Date comparisons use new system time (no validation). Acceptable for single-user, local-only app                                              | User backdates system, can mark todo complete before scheduled date. Not a security issue; user is not cheating anyone but themselves |
| DST transition (spring/fall)                        | JavaScript Date handles automatically; no special logic needed                                                                                | Schedule for day before DST change; completion comparison unaffected                                                                  |
| Leap years, leap seconds                            | JavaScript Date handles leap years correctly; leap seconds are not supported (rare, not a concern for daily todos)                            | Works correctly                                                                                                                       |
| Midnight edge case (11:59 PM → 12:01 AM)            | With day-only scheduling, both times fall in same "day" for scheduling                                                                        | Schedule for "today" at 11:59 PM; midnight passes; still "today" for scheduling purposes                                              |

### Decision Contract

```javascript
// Date storage
function normalizeDateToMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function scheduleDate(dateString: string): string {
  const date = new Date(dateString);
  return normalizeDateToMidnight(date).toISOString();
}

// Date comparison
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function daysSince(fromDate: Date, toDate: Date): number {
  const from = normalizeDateToMidnight(fromDate);
  const to = normalizeDateToMidnight(toDate);
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}
```

**Alternatives Rejected**:

- UTC-only storage: Breaks user intuition ("schedule for tomorrow" should work regardless of timezone).
- Explicit timezone field: Out of scope (added complexity, spec does not require).
- Server-side date logic: Not applicable (offline-capable, client-only app).

---

## Summary: Research Complete

| Clarification                | Decision                                | Rationale                                            |
| ---------------------------- | --------------------------------------- | ---------------------------------------------------- |
| Date library vs. native Date | Use native Date + ISO 8601 strings      | Zero dependencies, Constitution efficiency principle |
| localStorage quota impact    | No action required; <1KB per 1000 todos | Negligible impact relative to 5MB quota              |
| Timezone/edge cases          | Device timezone, day-only normalization | Matches user intent, aligns with spec assumptions    |

**Status**: ✅ All NEEDS CLARIFICATION items resolved. Ready for Phase 1 Design.
