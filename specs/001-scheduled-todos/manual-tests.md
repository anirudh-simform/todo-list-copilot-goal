# Manual Test Cases: Scheduled Todos Feature

## US1: Create a Todo for a Future Date

### Test 1.1: Create unscheduled todo
1. Open the app
2. Type "Buy milk" in the input field
3. Click "Add"
4. **Expected**: Todo appears in the list with no date badge

### Test 1.2: Create todo scheduled for tomorrow
1. Type "Call mom tomorrow" in the input field
2. Click the 📅 button to show scheduled date picker
3. Select tomorrow's date (May 13, 2026)
4. Click "Add"
5. **Expected**: 
   - Todo appears in list with blue "📅 May 13" badge
   - Date picker closes and resets

### Test 1.3: Create todo scheduled for next week
1. Type "Team meeting next week" in the input field
2. Click 📅 button
3. Select May 19, 2026 (one week from now)
4. Click "Add"
5. **Expected**: Blue badge shows "May 19"

### Test 1.4: Cannot schedule for past date
1. Click 📅 button
2. Try to select May 11, 2026 (yesterday)
3. **Expected**: Date picker minimum is set to today (May 12), cannot select past dates

### Test 1.5: Format date correctly in different languages
1. Create todo with scheduled date May 15
2. Verify badge shows "May 15" (or equivalent in system locale)
3. **Expected**: Date is formatted using user's locale settings

---

## US2: Complete a Todo Only on/After Scheduled Date

### Test 2.1: Cannot complete future-scheduled todo
1. Create todo "Buy supplies" scheduled for May 20 (8 days from now)
2. Try to click the checkbox to mark complete
3. **Expected**:
   - Checkbox is disabled (grayed out)
   - Tooltip shows "Available after May 20"
   - Alert message: "This todo is scheduled for a future date..."

### Test 2.2: Can complete today-scheduled todo
1. Create todo "Daily standup" scheduled for May 12 (today)
2. Click the checkbox to mark complete
3. **Expected**:
   - Todo marks complete immediately
   - Strikethrough appears on text

### Test 2.3: Can complete past-scheduled todo
1. Create todo "Old task" scheduled for May 10 (past)
2. Click the checkbox
3. **Expected**: Todo marks complete immediately

### Test 2.4: Can uncomplete a scheduled todo that hasn't arrived yet
1. Create todo "Future task" scheduled for May 20
2. Wait (or simulate) until May 20
3. Mark complete
4. Click checkbox again to uncomplete
5. **Expected**: Unchecking works without any date validation

### Test 2.5: Disabled state shows visual feedback
1. Create future-scheduled todo
2. **Expected**: 
   - Checkbox appears grayed out
   - Mouse hover shows disabled cursor (not-allowed)
   - Title attribute shows "Available after [date]"

---

## US3: Automatically Mark Todos as Overdue

### Test 3.1: On-time completion (same day)
1. Create todo "Report due today" scheduled for May 12, 2026
2. Mark complete on May 12, 2026
3. **Expected**:
   - Gray badge shows "May 12"
   - Status is "completed_on_time" (no overdue flag)

### Test 3.2: One day late (edge case - exactly 1 day)
1. Create todo "Yesterday's task" scheduled for May 12, 2026
2. Mark complete on May 13, 2026 at any time
3. **Expected**:
   - Badge shows date
   - Status is "completed_on_time" (1 day late is still on-time per spec)

### Test 3.3: Overdue (>1 day late)
1. Create todo "Old task" scheduled for May 12, 2026
2. Mark complete on May 14, 2026 or later
3. **Expected**:
   - Red "⚠️ OVERDUE" badge appears
   - Status is "completed_overdue"
   - Badge persists after page reload

### Test 3.4: Unscheduled todos never marked overdue
1. Create unscheduled todo "Always available"
2. Mark complete at any time (future or past)
3. **Expected**: No overdue flag, no overdue badge

### Test 3.5: Overdue status persists
1. Create and complete a todo 3 days late (marked overdue)
2. Reload the page (refresh browser)
3. **Expected**: 
   - Todo still shows "⚠️ OVERDUE" badge
   - localStorage preserved the `isOverdue` field

---

## US4: Visual Distinctions

### Test 4.1: View all 5 todo states simultaneously
1. Create 5 todos with different states:
   - Todo A: Unscheduled, incomplete (pending)
   - Todo B: Scheduled May 15, incomplete (scheduled)
   - Todo C: Scheduled May 12, incomplete (ready)
   - Todo D: Unscheduled, completed (completed_on_time)
   - Todo E: Scheduled May 10, completed 2 days late (completed_overdue)
2. **Expected**:
   - Todo A: No badge
   - Todo B: Blue "📅 May 15" badge
   - Todo C: Green "✓ May 12" badge
   - Todo D: Gray strikethrough, no badge
   - Todo E: Red "⚠️ OVERDUE" badge

### Test 4.2: Visual states are distinct
1. View all 5 todo states
2. **Expected**:
   - Each state has distinct color: blue, green, gray, red (overdue)
   - Badges are easy to distinguish
   - Completed todos have strikethrough
   - Font sizes and spacing are consistent

### Test 4.3: Light and dark mode styling
1. Create scheduled todo in light mode
2. Switch to dark mode (click moon icon)
3. **Expected**:
   - Badge colors are still distinct and readable
   - Contrast ratio meets WCAG AA (4.5:1 for text)
   - No visual regression

---

## Backward Compatibility Tests

### Test BC.1: Old todos without scheduled fields still work
1. Manually add an old todo to localStorage without `scheduledDate`:
   ```json
   { "id": 123, "text": "Old todo", "completed": false }
   ```
2. Reload the app
3. **Expected**:
   - Old todo loads correctly
   - No errors in console
   - Behaves as "pending" status (unscheduled)

### Test BC.2: Switching between scheduled and unscheduled
1. Create todo with scheduled date
2. Edit in browser dev tools to remove `scheduledDate` field
3. Reload
4. **Expected**: Todo behaves as unscheduled

---

## Edge Cases

### Test EC.1: Midnight handling
1. Create todo scheduled for May 20
2. Mark complete at 11:59:59 PM on May 19
3. **Expected**: Block with "Available after May 20" message

4. Mark complete at 12:00:01 AM on May 20
5. **Expected**: Allow completion

### Test EC.2: DST transition (March → April)
1. Create todo scheduled for April 15 (after DST change)
2. Complete on April 15
3. **Expected**: Correctly identifies as same day despite time shift

### Test EC.3: Year boundary
1. Create todo scheduled for January 1, 2027
2. Complete on December 31, 2026
3. **Expected**: Blocked with message about future date

4. Complete on January 1, 2027
5. **Expected**: Allowed (on-time)

### Test EC.4: Far future dates
1. Create todo scheduled for December 31, 2099
2. **Expected**: Date picker accepts it, badge displays correctly

### Test EC.5: Form cleanup after creation
1. Create todo with deadline and scheduled date
2. Submit form
3. **Expected**:
   - All input fields cleared
   - Both date picker and time picker collapsed
   - Scheduled date signal reset to null
   - Ready for next todo

---

## Accessibility Tests (WCAG 2.2 AA)

### Test A11Y.1: Keyboard navigation
1. Tab through form elements
2. **Expected**: 
   - All buttons reachable via Tab
   - Date picker input accessible
   - Focus indicators visible

### Test A11Y.2: Screen reader announces scheduled date
1. Create scheduled todo
2. Listen with screen reader
3. **Expected**: Screen reader announces date badge content (e.g., "May 15")

### Test A11Y.3: Disabled button announced
1. Create future-scheduled todo
2. Tab to checkbox
3. Screen reader announces: "checkbox, unavailable, disabled"
4. **Expected**: User understands it cannot be clicked

### Test A11Y.4: Color contrast
1. View badges in light mode
2. Measure contrast:
   - Blue badge: 7:1 or higher
   - Green badge: 6:1 or higher  
   - Gray badge: 4.5:1 or higher
   - Red badge: 7:1 or higher
3. **Expected**: All meet WCAG AA (4.5:1)

---

## Performance Tests

### Test PERF.1: Create 100 todos with dates
1. Add 100 todos with various scheduled dates
2. **Expected**:
   - App remains responsive
   - No jank or stuttering
   - List scrolls smoothly

### Test PERF.2: Filter performance
1. Create 100 todos
2. Switch between all/active/completed filters
3. **Expected**: Instant response (no lag)

### Test PERF.3: Render optimization
1. Mark todos complete/incomplete repeatedly
2. **Expected**:
   - No unnecessary re-renders
   - SolidJS memo prevents badge re-calc on unrelated changes
