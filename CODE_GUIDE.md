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
| Grade category choices | app.js | GRADE_CATEGORIES near the top; the Add Row button uses the first category in this list |
| Grade math | app.js | getRowGrade() for one row and getOverallRawGrade() for the combined result |
| Task, class, or expense form fields and save behavior | app.js | openDialog() and its add-task, add-class, add-expense, and edit-budget entries |
| How tasks are shown or completed | app.js | tasksMarkup() and renderTasks() |
| Timetable days or time slots | app.js | DAYS, HOURS, and the classes list in seed |
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

- **Overview:** summary cards for open tasks, remaining budget, and average grade; task preview; next class; spending summary; and reminder card.
- **Daily planner:** task list, All / To do / Completed filters, and a small weekly calendar.
- **Class schedule:** a timetable grid that JavaScript fills from the class data.
- **Budget:** allowance and spending totals, category filter, and expense list.
- **Grade calculator:** assessment rows with category, score, total points, per-row raw grade, and an overall computed raw grade.

The sections share a common page layout, and the footer closes the main content.

### Toast and entry dialog

The toast is a small status message used after actions such as adding an expense. The dialog is one shared form used to add tasks, classes, and expenses, and to edit the allowance. Grade assessments are entered directly in their table. The dialog's Cancel and close controls are `type="button"`, so they close it without submitting. Save is the form's submit button.

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

Task rows, check buttons, completed-task appearance, priority badges, delete controls, class previews, budget bars, recent transactions, and the reminder illustration are styled in this group.

### Planner, timetable, and budget

The planner layout styles the task list beside its focus panel. Timetable rules make the weekday grid scroll horizontally on narrow screens. Budget and expense rules style allowance cards, filters, transaction rows, category badges, and amounts.

### Grade calculator

These rules style the dark raw-grade banner, assessment table, category dropdowns, score and total inputs, compute/add-row buttons, and remove controls. On a phone, the table scrolls horizontally so its columns remain readable.

### Dialog and feedback

Form-field rules style the shared dialog inputs, selects, labels, action buttons, backdrop, and toast notification.

### Responsive behavior

The media queries reduce padding and columns for tablets, then stack the dashboard and planner cards for phones. The sidebar becomes a slide-in menu on smaller screens. The reduced-motion rule honors a device preference for less animation.

## `app.js` — data and behavior

### Startup wrapper and constants

The opening function wrapper keeps variables private to this script. The numbered comments divide the script into six broad areas. `KEY` names the local-storage entry. `DAYS` and `HOURS` define timetable columns and rows. `GRADE_CATEGORIES` supplies the category dropdown choices. `seed` is the starter planner data: allowance, tasks, classes, expenses, and grade rows.

When loading data from the earlier subject-average calculator, the app keeps those old grade records in `previousSubjectGrades` and starts the new assessment table with its sample rows. Other saved planner data remains in place.

### Helpers and saved state

`$` finds one HTML element; `$$` finds a group. The app loads saved JSON from `localStorage`, falling back to a copy of `seed` if nothing is saved or the stored value cannot be read. `persist()` writes the current full state back to the browser.

`money()` formats amounts as Philippine pesos. `escapeHtml()` protects user-entered text when it is inserted into HTML. `makeId()` creates an ID for newly added entries. The date setup fills the visible date and greeting. `toast()` briefly displays a status message.

### Rendering the content

The render functions turn the current `state` into visible HTML and totals. The state is the source of truth; after a change, the affected screen is refreshed from it.

- `tasksMarkup()` creates a task row, including its completion and delete controls.
- `getRowGrade()` calculates one item's score divided by its total points, as a percentage.
- `getOverallRawGrade()` combines completed items as total points earned divided by total possible points. An item worth more points has a larger effect on the overall raw grade. Category labels organize entries; they do not add separate category weights.
- `renderTasks()` updates task counts, progress, and the filtered task list.
- `renderBudget()` totals expenses, calculates the remaining allowance, and updates the dashboard and budget summary. It calls `renderExpenses()` to draw the expense list.
- `renderExpenses()` applies the selected category filter and formats expense dates.
- `renderGrades()` updates the overall raw-grade display and builds the assessment table, including a category selector and score/total inputs for each row. Results stay blank until Compute Grade is pressed.
- `toMinutes()` converts timetable times to numbers for sorting and finding the next class. The 1:00–4:00 entries are treated as afternoon classes.
- `renderClasses()` builds the weekday timetable and selects the next class for today.
- `renderWeek()` builds the small Monday-to-Sunday date strip.
- `render()` runs all renderers, then saves the current state.

### Navigation and interaction handlers

`navigate()` hides the other sections, highlights the active navigation link, updates the breadcrumb and URL hash, and closes the mobile sidebar. The nav-link handler calls it when a link is clicked. The menu button toggles the mobile sidebar.

A delegated document click handler handles controls that are created dynamically: opening an add dialog, completing or deleting a task, deleting a class, and deleting a grade row. Delegation means the app does not need to attach new listeners after every re-render.

The filter buttons update the task view. The expense dropdown filters expenses. The grade table's change handler updates an item's category, score, or total. Changing score or total clears the old result until Compute Grade is pressed again. Add Row creates a blank row using the first option in `GRADE_CATEGORIES`; Compute Grade displays per-item raw grades and the combined point-based raw grade.

### Dialog fields and saving

`field()` builds a labeled text/number/date input or select menu. `openDialog(action)` chooses a dialog configuration for tasks, expenses, classes, or the allowance. Each configuration supplies a title, fields, and a `save` function that updates the matching part of `state`. Grade rows are edited directly in the grade table rather than through this dialog.

Cancel and close call `dialog.close()` only. When Save submits the form, the submit handler checks required fields, calls the selected save function, refreshes and persists the planner, closes the dialog, and shows a toast.

### Reset and initial page

The reset button asks before replacing saved data with `seed`. At startup, the final line reads the URL hash to open a requested screen, defaults to Overview if the hash is unknown, and calls `render()` to draw the saved planner.
