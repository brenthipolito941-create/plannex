# Plannex code guide

Plannex is a browser-only planner made from three parts: HTML provides the content and controls, CSS controls appearance and layout, and JavaScript updates the screens and saves changes.

## Quick edit map

Use this as a starting point when you want to change something. Search for the name in the listed file if the line number changes later.

| If you want to change… | Open… | Look for… |
| --- | --- | --- |
| Page wording, button labels, or visible headings | index.html | The matching page section, such as page-planner or page-budget |
| The logo image | index.html | assets/plannex-logo.png in the brand link; replace that image file to use a different logo |
| Brand colors | styles.css | The variables at the top under :root, including --midnight, --surface, --green, --cloud, and --slate |
| Spacing, cards, buttons, or mobile layout | styles.css | The related comment group; screen-size changes are in the @media sections at the bottom |
| Starting tasks, classes, expenses, allowance, or grade examples | app.js | The seed object under “1. Starter data and settings” |
| Grade category choices | app.js | GRADE_CATEGORIES near the top; update seed.gradeWeights too if you add a category |
| Starting grade percentages | app.js | seed.gradeWeights; students can change these in the Grade calculator |
| 0-base or 50%-base grading | index.html and app.js | The `grade-base` selector chooses the saved scale; `applyGradingBase()` converts the weighted raw grade (50 base: 50 + raw percentage × 0.5) |
| Grade math | app.js | getRowGrade(), getGradeWeightTotal(), getGradedWeight(), and getOverallRawGrade() |
| Saved grades from the calculator | app.js | state.savedGrades, savedGradeMarkup(), renderSavedGrades(), and the save-grade/edit-saved-grade entries in openDialog() |
| Which class is up next | app.js | getNextClassState(), renderNextClass(), and normalizeClassEndTime() |
| Class start and end times | app.js | classFields() and the add-class/edit-class entries in openDialog(); older classes without an end time default to one hour |
| Task, class, or expense form fields and save behavior | app.js | openDialog() and its add-task, add-class, add-expense, and edit-budget entries |
| How tasks are shown or completed | app.js | tasksMarkup() and renderTasks() |
| How to edit a task, expense, or class | app.js | The pencil buttons in tasksMarkup(), renderExpenses(), and renderClasses(); openDialog() fills and saves the edit form |
| How to remove an expense | app.js | The data-delete-expense click handler and renderExpenses() remove button |
| Overview shortcut links | index.html and app.js | The data-page values on See all, Budget, and Full week; routed by the navigation handler |
| Task due date/time and reminder choice | app.js | The add-task fields in openDialog(), tasksMarkup(), and checkTaskReminders() |
| Reminder chime or notification permission behavior | app.js | playReminderAlarm(), prepareTaskReminder(), and startTaskReminderChecks() |
| Timetable days or standard time rows | app.js | DAYS and HOURS; student-entered times add their own rows automatically |
| How a class time is entered and displayed | app.js | normalizeClassTime(), formatTime(), and the add-class entry in openDialog() |
| 50/30/20 budget suggestions | app.js | The 0.5, 0.3, and 0.2 calculations inside renderBudget() |
| Weekly budget target and this week's expenses | app.js | The weekly budget calculations inside renderBudget(); the target uses monthly allowance × 12 ÷ 52 |
| Weekly budget wording or layout | index.html and styles.css | The weekly-budget-panel markup and matching .weekly-budget styles |
| Philippine peso formatting | app.js | money() and its PHP currency setting |
| What is saved in this browser | app.js | KEY and persist() |

### A note about starter data

Changing seed changes the sample data used on a fresh browser or after choosing the reset button. It does not replace data already saved in your browser automatically. The reset button restores the whole sample planner, so copy any personal entries you want to keep before using it.

### Adding another page

Add a navigation link in the sidebar and a matching section with id="page-name" and class="page-section" in index.html. Then add the page name to the title map inside navigate() and to the allowed-page list near the bottom of app.js. The part after page- must match the link's data-page value and URL hash.

## `index.html` — page structure

### Document setup

The first lines declare an HTML5 page, set English as its language, and configure mobile sizing. The description and theme color provide browser metadata. The page loads the Manrope and DM Sans fonts, then `styles.css` for appearance.

### Sidebar and navigation

The sidebar contains the Plannex brand lockup, the supplied logo, and links for Overview, Daily planner, Class schedule, My budget, and Grade calculator. Each link has a `data-page` value. JavaScript uses that value to show the matching page section. The profile and small reminder are decorative sample content.

### Top bar

The top bar contains the mobile menu button, current page name, today's date, and a reset button. JavaScript fills the date and page name, opens the mobile sidebar, and uses the reset button to restore the starter data.

### Main page sections

Each main screen is a `<section class="page-section">`. Its `id` follows the `page-<name>` pattern, such as `page-budget`. Only the active section is displayed.

- **Overview:** summary cards for open tasks, remaining budget, and the average raw score from saved grades; task preview; next class; saved subject grade list; spending summary; and reminder card. The schedule panel's Up Next card uses the live time and the saved timetable to show the class in progress or the next class today, including its start/end times and room, with the class after it shown as a small hint underneath. The saved grade list updates whenever a result is saved from the Grade Calculator and shows an empty state when nothing has been saved.
- **Daily planner:** task list, All / To do / Completed filters, and a small weekly calendar. New tasks include a due date and time, with an optional browser notification and alarm. Use the pencil control to edit a task. At the due time, an alert stays open and the chime repeats until the student presses Okay. Reminders are checked while the planner is open; desktop notifications depend on browser support, a secure origin such as HTTPS or localhost, and permission. Reliable alerts after the page is closed would need a hosted push service.
- **Class schedule:** a weekly timetable. Students enter a subject, weekday, exact start time, end time, and room. The grid adds a row for custom times and sorts it chronologically. Use the pencil and × controls on a class block to edit or remove that class. Classes saved before end times were added default to a one-hour block.
- **Budget:** monthly allowance, expenses, remaining amount, this week's target/spending/remaining total, and a suggested 50/30/20 split. The weekly target is the monthly allowance multiplied by 12 and divided by 52; expenses count for the current Monday-to-Sunday week based on their saved date. Changing the allowance updates both the weekly target and the three 50/30/20 suggestions. Expense rows have pencil and × controls for editing or removing entries.
- **Grade calculator:** editable syllabus weights, assessment rows with category, earned points, possible points, item percentage, and an overall weighted grade. After computing, the student can save the result with a subject name and grading system or return to editing and compute again. Saved subject grades appear on this page with their 0-based or 50-based badge and can be edited or removed.

The sections share a common page layout, and the footer closes the main content.

### Toast and entry dialog

The toast is a small status message used after actions such as adding an expense. The dialog is one shared form used to add or edit tasks, classes, and expenses, and to edit the allowance. When editing, the dialog is prefilled with the selected entry; saving updates that entry in place. A task's due date and time are stored separately, and its reminder checkbox is saved as `notify`. Grade assessments are entered directly in their table. The dialog's Cancel and close controls are `type="button"`, so they close it without submitting. Save is the form's submit button.

The final script tag loads `app.js` after the page elements exist, allowing JavaScript to find and update them.

## `styles.css` — visual design and layout

### Color tokens and defaults

The `:root` variables hold the supplied palette: Midnight, Surface, Green, Cloud, and Slate. Other tokens hold text colors, borders, and small supporting colors. Shared defaults set box sizing, page background, typography, and button behavior.

### Sidebar and brand

These rules style the fixed dark sidebar, logo tile, wordmark, tagline, navigation links, selected-link state, reminder, and student profile.

### Header and page frame

The top bar, breadcrumb, date chip, central content width, page headings, subtitles, and buttons are styled here. `.page-section` is hidden by default; `.active-page` displays the selected screen. A short fade animation softens navigation.

### Cards and dashboard

The stat-card rules style the three summary cards and their icons and progress bars. Panel, heading, link, and dashboard-grid rules create the Overview layout.

### Tasks and schedule cards

Task rows, check buttons, completed-task appearance, priority badges, delete controls, class previews, budget bars, recent transactions, and the reminder illustration are styled in this group. The Up Next class card uses the existing class-card rules plus a compact start/end time stack, a NOW or UP NEXT badge, and muted end times.

### Planner, timetable, and budget

The planner layout styles the task list beside its focus panel. Timetable rules make the weekday grid scroll horizontally on narrow screens. Budget and expense rules style allowance cards, filters, transaction rows, category badges, and amounts.

The weekly budget panel has three compact cards for the weekly target, amount spent in the displayed Monday-to-Sunday date range, and amount left. The weekly target is an average based on 52 weeks per year. Its cards and the 50/30/20 rule cards change to a single column on small screens.

### Grade calculator

The weight panel styles one percentage input per category and the status message that reports whether the values total 100%. The assessment table styles category, score, possible points, item-grade, and remove controls. The saved-grade panels use compact rows for the subject, raw score, 0-based/50-based badge, save date, and edit/remove controls; the Overview uses a two-column row grid that becomes one column on phones. On a phone, weight inputs use two columns, saved-grade marks are hidden to keep the row compact, and the table scrolls horizontally.

### Dialog and feedback

Form-field rules style the shared dialog inputs, selects, labels, action buttons, backdrop, and toast notification.

### Responsive behavior

The media queries reduce padding and columns for tablets, then stack the dashboard and planner cards for phones. The sidebar becomes a slide-in menu on smaller screens. The reduced-motion rule honors a device preference for less animation.

## `app.js` — data and behavior

### Startup wrapper and constants

The opening function wrapper keeps variables private to this script. The numbered comments divide the script into six broad areas. `KEY` names the local-storage entry. `DAYS` and `HOURS` define the weekday columns and the standard timetable rows. `GRADE_CATEGORIES` supplies the category dropdown choices, and `GRADE_SYSTEMS` supplies the 0-based and 50-based labels used when saving a grade. `seed` is the starter planner data: allowance, category percentages, saved grades, tasks, classes, expenses, and grade rows. The example weights are Exam 40%, Performance Task 40%, Quiz 10%, Long Quiz 0%, and Assignment 10%.

`normalizeClassTime()` converts a time-picker value such as `13:30`, or a supported older saved time such as `2:00 PM`, into 24-hour `HH:mm` text. This makes sorting and matching predictable. `normalizeClassEndTime()` adds a one-hour end time to older classes that do not have one and keeps every end after its start. During loading, saved data is combined with new defaults, class times and end times are normalized, saved subject grades are cleaned up, and missing grade weights are filled from the starter settings. When loading data from the earlier subject-average calculator, the app keeps those old grade records in `previousSubjectGrades` and starts the assessment table with its sample rows. Other saved planner data remains in place.

### Helpers and saved state

`$` finds one HTML element; `$$` finds a group. The app loads saved JSON from `localStorage`, falling back to a copy of `seed` if nothing is saved or the stored value cannot be read. `persist()` writes the current full state back to the browser.

`money()` formats amounts as Philippine pesos. `escapeHtml()` protects user-entered text when it is inserted into HTML. `makeId()` creates an ID for newly added entries. The date setup fills the visible date and greeting. `toast()` briefly displays a status message.

### Rendering the content

The render functions turn the current `state` into visible HTML and totals. The state is the source of truth; after a change, the affected screen is refreshed from it.

- `tasksMarkup()` creates a task row, including its completion, edit, and delete controls.
- `getRowGrade()` calculates one item's score divided by its possible points, as a percentage. For example, 18 points out of 20 is 90%.
- `getGradeWeightTotal()` adds the percentages assigned to every category. The calculator requires this total to equal 100%.
- `getGradedWeight()` checks which weighted categories contain valid assessment scores, then reports how much of the course weight those categories cover.
- `getOverallRawGrade()` first calculates each scored category's points-earned divided by points-possible percentage. It multiplies each category percentage by that category's syllabus weight, adds those weighted results, and divides by the weight of categories with scores. That last step makes the display a current estimate when the student has not entered every category yet.
- `applyGradingBase()` converts that weighted raw result to the selected scale. A 0 base leaves it unchanged; a 50% base uses `50 + (raw percentage × 0.5)`, so 80% becomes 90%. The assessment table continues to show the raw score percentages.
- Example: if Exams are 40% and the exam category average is 80%, exams contribute 32 weighted points (`80 × 0.40`) to the full course result. If Performance Tasks are also 40% and average 90%, they contribute 36 points. The displayed current grade uses the scored categories' combined weight as its denominator; it is not a final course grade until the remaining categories are entered.
- `savedGradeMarkup()` creates the saved subject rows used on both the Overview and Grade Calculator. Each row shows the raw grade, the 0-based or 50-based badge, and the converted final when a 50 base is selected. `renderSavedGrades()` fills both lists, updates the dashboard average and empty states, and sorts the newest saved grades first.
- `renderTasks()` updates task counts, progress, and the filtered task list.
- `tasksMarkup()` shows each task deadline and whether its reminder is set or already sent. `checkTaskReminders()` looks for due, unfinished tasks that opted into reminders, sends each reminder once, then saves the sent time. `startTaskReminderChecks()` checks every 15 seconds and again when the student returns to the tab. `startReminderAlarm()` opens the acknowledgement dialog and repeats the Web Audio chime; `stopReminderAlarm()` clears the repeat timer and closes it when Okay is clicked. A desktop notification requires permission. Because this app is a static page, its timer stops when the page closes; background push needs a service worker and a push server.
- `renderExpenses()` displays expense rows with edit and remove controls. The delegated click handler calls `openDialog()` with the entry ID for edits or removes the saved item and recalculates the budget.
- `renderBudget()` totals expenses, calculates the remaining allowance, and updates the dashboard and budget summary. It finds Monday and Sunday for the current week, adds only expenses dated in that range, and shows a weekly target calculated as monthly allowance × 12 ÷ 52. For a ₱12,000 monthly allowance, the average weekly target is about ₱2,769. It also calculates 50% for needs, 30% for wants, and 20% for savings; that same ₱12,000 suggests ₱6,000, ₱3,600, and ₱2,400. It calls `renderExpenses()` to draw the expense list.
- `renderExpenses()` applies the selected category filter and formats expense dates.
- `renderGradeWeights()` creates the editable percentage fields from `GRADE_CATEGORIES`.
- `renderGradeSummary()` reports the total course weight, shows an error or success message, displays the current weighted grade after calculation, and switches the action row between Add Row/Compute Grade and Save Grade/Compute Again.
- `renderGrades()` updates the grade summary and builds the assessment table, including a category selector and score/possible inputs. Results stay blank until Compute Grade is pressed again after a change.
- `toMinutes()` converts normalized timetable times to numbers for sorting and finding the next class. Legacy `1:00`–`4:00` sample times are treated as afternoon classes during migration.
- `normalizeClassEndTime()` keeps each class end after its start. Older saved classes without an end time receive a one-hour block so the saved timetable can still drive Up Next.
- `formatTime()` displays the stored 24-hour time in a readable 12-hour format.
- `getNextClassState()` compares the live clock with today's saved classes: a class in progress is shown as NOW; otherwise the next start time is selected. It also returns the class after that one. `renderNextClass()` draws the primary class as NOW or UP NEXT, then shows the following class in a smaller hint row labeled UP NEXT or THEN, so the main card stays in focus. Both rows include the subject's start/end times and room when available, plus the relevant empty message. The app refreshes these cards every 30 seconds and when the student returns to the tab.
- `renderClasses()` builds rows from the standard hours plus any custom student-entered times, places each class on its weekday, adds edit/remove buttons to the class blocks, and asks `renderNextClass()` to update Up Next.
- `renderWeek()` builds the small Monday-to-Sunday date strip.
- `render()` runs all renderers, then saves the current state.

### Navigation and interaction handlers

`navigate()` hides the other sections, highlights the active navigation link, updates the breadcrumb and URL hash, and closes the mobile sidebar. The nav-link handler calls it when a link is clicked. The menu button toggles the mobile sidebar.

A delegated document click handler handles controls that are created dynamically: opening an add dialog, completing or deleting a task, deleting a class, deleting a grade row, and editing or removing a saved grade. Delegation means the app does not need to attach new listeners after every re-render.

The filter buttons update the task view. The expense dropdown filters expenses. The grade-weight change handler saves the edited category percentage and clears the old grade result. The grading-base selector saves either 0 or 50 and immediately updates a computed result. The grade table's change handler updates an item's category, score, or possible points and clears the old result. Add Row creates a blank row using the first option in `GRADE_CATEGORIES`. Compute Grade first checks that the category weights total 100% and that a scored category has a non-zero weight; then it displays raw item percentages and the weighted course grade using the selected base. Save Grade opens the shared dialog for a subject name and grading system, and Compute Again returns the tracker to editing so the student can calculate another result without being forced to save.

### Dialog fields and saving

`field()` builds a labeled text/number/date/time input or select menu. `openDialog(action)` chooses a dialog configuration for tasks, expenses, classes, the allowance, or saved grades. The class form uses the browser's time picker, so the student selects the exact start and end time; saving stores both in normalized `HH:mm` form and adjusts an invalid end time to one hour after the start. The Save Grade dialog previews the computed raw grade and updates the final preview when the 0-based or 50-based option changes. It blocks an exact duplicate and offers to replace an existing subject when the result is different. Each dialog configuration supplies a title, fields, and a `save` function that updates the matching part of `state`. Grade rows and category weights are edited directly on the grade page rather than through this dialog.

Cancel and close call `dialog.close()` only. When Save submits the form, the submit handler checks required fields, calls the selected save function, refreshes and persists the planner, closes the dialog, and shows a toast. A save function can return `false` to keep the dialog open with a message, or return a string to replace the default success message.

### Reset and initial page

The reset button asks before replacing saved data with `seed`. At startup, the final line reads the URL hash to open a requested screen, defaults to Overview if the hash is unknown, and calls `render()` to draw the saved planner.
