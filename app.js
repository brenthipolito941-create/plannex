(() => {
  // 1. Starter data and settings
  // These values set the first-run sample content and the timetable/grade options.
  const KEY = "plannex-student-planner-v1";
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const HOURS = [
    "8:00",
    "9:00",
    "10:00",
    "11:00",
    "12:00",
    "1:00",
    "2:00",
    "3:00",
    "4:00",
  ];
  const GRADE_CATEGORIES = ["Quiz", "Long Quiz", "Assignment", "Exam"];
  const seed = {
    allowance: 12000,
    tasks: [
      {
        id: "t1",
        title: "Finish biology lab notes",
        due: "Today · 11:30 AM",
        priority: "High",
        done: false,
      },
      {
        id: "t2",
        title: "Read chapter 4 for literature",
        due: "Today · 2:00 PM",
        priority: "Medium",
        done: false,
      },
      {
        id: "t3",
        title: "Submit statistics problem set",
        due: "Today · 5:00 PM",
        priority: "High",
        done: true,
      },
      {
        id: "t4",
        title: "Pack things for tomorrow",
        due: "Today · Anytime",
        priority: "Low",
        done: false,
      },
    ],
    classes: [
      {
        id: "c1",
        day: "Mon",
        time: "9:00",
        name: "Biology 101",
        room: "Science Hall · 204",
      },
      {
        id: "c2",
        day: "Mon",
        time: "11:00",
        name: "Literature & Society",
        room: "Arts Building · 12",
      },
      {
        id: "c3",
        day: "Mon",
        time: "2:00",
        name: "Statistics",
        room: "Main Building · 305",
      },
      {
        id: "c4",
        day: "Tue",
        time: "8:00",
        name: "Communication",
        room: "Arts Building · 18",
      },
      {
        id: "c5",
        day: "Tue",
        time: "10:00",
        name: "Biology 101",
        room: "Science Hall · 204",
      },
      {
        id: "c6",
        day: "Tue",
        time: "1:00",
        name: "Physical Education",
        room: "Gymnasium",
      },
      {
        id: "c7",
        day: "Wed",
        time: "9:00",
        name: "Biology 101",
        room: "Science Hall · 204",
      },
      {
        id: "c8",
        day: "Wed",
        time: "11:00",
        name: "Literature & Society",
        room: "Arts Building · 12",
      },
      {
        id: "c9",
        day: "Wed",
        time: "2:00",
        name: "Statistics",
        room: "Main Building · 305",
      },
      {
        id: "c10",
        day: "Thu",
        time: "8:00",
        name: "Communication",
        room: "Arts Building · 18",
      },
      {
        id: "c11",
        day: "Thu",
        time: "10:00",
        name: "Biology 101",
        room: "Science Hall · 204",
      },
      {
        id: "c12",
        day: "Fri",
        time: "9:00",
        name: "Literature & Society",
        room: "Arts Building · 12",
      },
      {
        id: "c13",
        day: "Fri",
        time: "11:00",
        name: "Statistics",
        room: "Main Building · 305",
      },
    ],
    expenses: [
      {
        id: "e1",
        name: "Lunch at campus",
        category: "Food",
        amount: 145,
        date: "2026-10-17",
      },
      {
        id: "e2",
        name: "Jeepney fare",
        category: "Transport",
        amount: 40,
        date: "2026-10-16",
      },
      {
        id: "e3",
        name: "Notebook & pens",
        category: "School",
        amount: 185,
        date: "2026-10-15",
      },
      {
        id: "e4",
        name: "Iced coffee",
        category: "Food",
        amount: 120,
        date: "2026-10-14",
      },
    ],
    gradesComputed: false,
    grades: [
      { id: "g1", category: "Quiz", score: 18, total: 20 },
      { id: "g2", category: "Quiz", score: 15, total: 20 },
      { id: "g3", category: "Long Quiz", score: 42, total: 50 },
      { id: "g4", category: "Assignment", score: 27, total: 30 },
      { id: "g5", category: "Exam", score: 84, total: 100 },
    ],
  };

  // 2. Saved state and small helpers
  // Short DOM helpers keep the render functions readable.
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  let state;
  try {
    state = JSON.parse(localStorage.getItem(KEY)) || structuredClone(seed);
    // Keep old subject grades in storage before switching to assessment rows.
    if (state.grades?.some((grade) => !("category" in grade))) {
      state.previousSubjectGrades = structuredClone(state.grades);
      state.grades = structuredClone(seed.grades);
      state.gradesComputed = false;
    }
    if (typeof state.gradesComputed !== "boolean") state.gradesComputed = false;
  } catch {
    state = structuredClone(seed);
  }
  // Save the complete planner snapshot after each change so the sections stay in sync.
  const persist = () => localStorage.setItem(KEY, JSON.stringify(state));
  const money = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  const EXPENSE_ICONS = {
    Food: "☕",
    Transport: "↗",
    School: "✎",
    Personal: "♡",
    Other: "·",
  };
  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const makeId = () =>
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const today = new Date();
  const friendlyDate = today.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  $("#today-label").textContent = friendlyDate;
  $("#planner-date").textContent = `TODAY · ${friendlyDate.toUpperCase()}`;
  $("#greeting").textContent =
    `${today.getHours() < 12 ? "GOOD MORNING" : today.getHours() < 18 ? "GOOD AFTERNOON" : "GOOD EVENING"}, JAMIE`;
  const toast = (message) => {
    const node = $("#toast");
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 2200);
  };

  // 3. Rendering helpers
  // These functions turn saved state into the cards, tables, and totals on screen.
  // Shared markup keeps task rows consistent on the dashboard and full planner page.
  function tasksMarkup(tasks, controls = true) {
    if (!tasks.length)
      return '<div class="empty-state">Nothing here just yet. Add a task when you’re ready.</div>';
    return tasks
      .map(
        (task) =>
          `<div class="task-row ${task.done ? "task-done" : ""}"><button class="check-button ${task.done ? "checked" : ""}" data-toggle-task="${task.id}" aria-label="${task.done ? "Mark incomplete" : "Mark complete"}">${task.done ? "✓" : ""}</button><div class="task-copy"><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.due || "Today")}</small></div><span class="priority ${(task.priority || "Medium").toLowerCase()}">${escapeHtml(task.priority || "Medium")}</span>${controls ? `<span class="task-actions"><button class="tiny-action" data-delete-task="${task.id}" aria-label="Delete task">×</button></span>` : ""}</div>`,
      )
      .join("");
  }
  function getRowGrade(row) {
    if (row.score === "" || row.score == null || row.total === "" || row.total == null)
      return null;
    const score = Number(row.score);
    const total = Number(row.total);
    return Number.isFinite(score) && Number.isFinite(total) && total > 0
      ? (score / total) * 100
      : null;
  }
  // Calculate a raw grade from points, so items with larger totals naturally count more.
  function getOverallRawGrade() {
    const valid = state.grades.filter((row) => getRowGrade(row) !== null);
    if (!valid.length) return null;
    const earned = valid.reduce((sum, row) => sum + Number(row.score), 0);
    const possible = valid.reduce((sum, row) => sum + Number(row.total), 0);
    return possible > 0 ? (earned / possible) * 100 : null;
  }
  function renderTasks() {
    const remaining = state.tasks.filter((t) => !t.done).length,
      done = state.tasks.length - remaining;
    $("#stat-tasks").innerHTML =
      `${remaining} <small>${remaining === 1 ? "task" : "tasks"} left</small>`;
    $("#today-count").textContent = state.tasks.length;
    $("#planner-count").textContent = remaining;
    $("#task-foot").textContent = state.tasks.length
      ? `${done} of ${state.tasks.length} completed`
      : "Add a task to get started";
    $("#task-progress").style.width =
      `${state.tasks.length ? (done / state.tasks.length) * 100 : 0}%`;
    $("#overview-tasks").innerHTML = tasksMarkup(state.tasks.slice(0, 4));
    const filter = $(".filter-tab.selected")?.dataset.filter || "all";
    $("#planner-tasks").innerHTML = tasksMarkup(
      state.tasks.filter(
        (t) => filter === "all" || (filter === "open" ? !t.done : t.done),
      ),
    );
  }
  function renderBudget() {
    const spent = state.expenses.reduce((sum, e) => sum + Number(e.amount), 0),
      remaining = Number(state.allowance) - spent,
      ratio =
        Number(state.allowance) > 0
          ? Math.min(100, (spent / Number(state.allowance)) * 100)
          : 100;
    $("#stat-budget").textContent = money(remaining);
    $("#budget-foot").textContent =
      `of your ${money(state.allowance)} monthly allowance`;
    $("#overview-spent").textContent = money(spent);
    $("#spent-label").textContent = `${money(spent)} spent`;
    $("#limit-label").textContent = `${money(state.allowance)} limit`;
    $("#budget-bar").style.width = `${ratio}%`;
    $("#budget-total").textContent = money(state.allowance);
    $("#budget-spent").textContent = money(spent);
    $("#budget-remaining").textContent = money(remaining);
    $("#budget-remaining").style.color = remaining < 0 ? "#ce8065" : "";
    $("#budget-remaining-note").textContent =
      remaining < 0 ? "Over your monthly allowance" : "You’re doing great";
    const icons = EXPENSE_ICONS;
    $("#recent-transactions").innerHTML =
      state.expenses
        .slice(0, 2)
        .map(
          (e) =>
            `<div class="transaction-row"><span class="transaction-icon">${icons[e.category] || "·"}</span><span class="transaction-info"><strong>${escapeHtml(e.name)}</strong><small>${escapeHtml(e.category)}</small></span><span class="transaction-amount">−${money(e.amount)}</span></div>`,
        )
        .join("") || '<div class="empty-state">No expenses yet.</div>';
    renderExpenses();
  }
  function renderExpenses() {
    const filter = $("#expense-filter").value;
    const rows = state.expenses.filter(
      (e) => filter === "all" || e.category === filter,
    );
    const icons = EXPENSE_ICONS;
    $("#expense-list").innerHTML = rows.length
      ? rows
          .map(
            (e) =>
              `<div class="expense-row"><span class="expense-icon">${icons[e.category] || "·"}</span><span class="expense-copy"><strong>${escapeHtml(e.name)}</strong><small>${new Date(`${e.date}T12:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</small></span><span class="expense-category">${escapeHtml(e.category)}</span><span class="expense-amount">−${money(e.amount)}</span></div>`,
          )
          .join("")
      : '<div class="empty-state">No expenses in this category.</div>';
  }
  function renderGradeSummary() {
    const avg = state.gradesComputed ? getOverallRawGrade() : null;
    $("#stat-grade").innerHTML =
      avg === null
        ? "— <small>%</small>"
        : `${avg.toFixed(1)}<small>%</small>`;
    $("#grade-average").innerHTML =
      avg === null ? "—<small>%</small>" : `${avg.toFixed(1)}<small>%</small>`;
    $("#grade-caption").textContent =
      avg === null
        ? "Enter scores and totals, then compute your grade."
        : avg >= 90
          ? "Excellent work — your effort is showing."
          : avg >= 75
            ? "You’re making steady progress. Keep going."
            : "Use this result to guide your next study session.";
    $("#grade-count").textContent =
      `${state.grades.length} ${state.grades.length === 1 ? "row" : "rows"}`;
  }
  function renderGrades() {
    renderGradeSummary();
    $("#grade-rows").innerHTML = state.grades.length
      ? state.grades
          .map(
            (row) => {
              const rawGrade = getRowGrade(row);
              return `<tr><td><select data-grade-row="${row.id}" data-grade-field="category" aria-label="Assessment category">${GRADE_CATEGORIES.map((category) => `<option value="${category}" ${row.category === category ? "selected" : ""}>${category}</option>`).join("")}</select></td><td><input type="number" min="0" step="any" value="${row.score ?? ""}" placeholder="Score" data-grade-row="${row.id}" data-grade-field="score" aria-label="Score"></td><td><input type="number" min="0.01" step="any" value="${row.total ?? ""}" placeholder="Total" data-grade-row="${row.id}" data-grade-field="total" aria-label="Total possible points"></td><td class="grade-raw">${state.gradesComputed && rawGrade !== null ? `${rawGrade.toFixed(1)}%` : "—"}</td><td><button class="row-action" data-delete-grade="${row.id}" aria-label="Remove grade row">×</button></td></tr>`;
            },
          )
          .join("")
      : '<tr><td colspan="5"><div class="empty-state">No grade rows yet. Add a row to get started.</div></td></tr>';
  }
  // The timetable uses 1:00–4:00 for afternoon classes; normalize those for comparisons.
  function toMinutes(time) {
    const [hour, minute] = time.split(":").map(Number);
    const normalized = hour >= 1 && hour <= 4 ? hour + 12 : hour;
    return normalized * 60 + (minute || 0);
  }
  function renderClasses() {
    const grid = $("#timetable");
    grid.innerHTML = `<div class="time-head">TIME</div>${DAYS.map((d) => `<div class="day-head">${d.toUpperCase()}</div>`).join("")}`;
    for (const hour of HOURS) {
      grid.insertAdjacentHTML(
        "beforeend",
        `<div class="time-slot">${hour}</div>`,
      );
      for (const day of DAYS) {
        const item = state.classes.find(
          (c) => c.day === day && parseInt(c.time, 10) === parseInt(hour, 10),
        );
        grid.insertAdjacentHTML(
          "beforeend",
          `<div class="class-slot">${item ? `<div class="class-block" title="Click to remove this class" data-delete-class="${item.id}"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.room)}</small></div>` : ""}</div>`,
        );
      }
    }
    const todayCode = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
      today.getDay()
    ];
    const now = today.getHours() * 60 + today.getMinutes();
    const upcoming = state.classes
      .filter((c) => c.day === todayCode && toMinutes(c.time) >= now)
      .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))[0];
    const next = $("#next-class");
    next.innerHTML = upcoming
      ? `<div class="class-card"><span class="class-time">${escapeHtml(upcoming.time)}</span><span class="class-stripe"></span><span class="class-info"><strong>${escapeHtml(upcoming.name)}</strong><small>${escapeHtml(upcoming.room)}</small></span></div><div class="no-class">Your next class today.</div>`
      : `<div class="no-class">${DAYS.includes(todayCode) ? "No more classes today. Take a breather." : "No classes scheduled today. Enjoy your day."}</div>`;
  }
  function renderWeek() {
    const start = new Date(today);
    start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    $("#week-mini").innerHTML = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return `<div class="mini-day ${i === (today.getDay() + 6) % 7 ? "current" : ""}">${["M", "T", "W", "T", "F", "S", "S"][i]}<b>${date.getDate()}</b></div>`;
    }).join("");
  }
  function render() {
    renderTasks();
    renderBudget();
    renderGrades();
    renderClasses();
    renderWeek();
    persist();
  }

  // 4. Navigation and page interactions
  function navigate(page) {
    if (!$("#page-" + page)) page = "overview";
    $$(".page-section").forEach((n) =>
      n.classList.toggle("active-page", n.id === `page-${page}`),
    );
    $$(".nav-link").forEach((n) =>
      n.classList.toggle("active", n.dataset.page === page),
    );
    $("#crumb-current").textContent = {
      overview: "Overview",
      planner: "Daily planner",
      classes: "Class schedule",
      budget: "My budget",
      grades: "Grade calculator",
    }[page];
    history.replaceState(null, "", `#${page}`);
    $("#sidebar").classList.remove("open");
  }
  $$(".nav-link").forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.dataset.page);
    }),
  );
  $("#menu-toggle").addEventListener("click", () =>
    $("#sidebar").classList.toggle("open"),
  );
  // Delegate clicks because task, class, and grade controls are rebuilt during rendering.
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (target) openDialog(target.dataset.action);
    const toggle = e.target.closest("[data-toggle-task]");
    if (toggle) {
      const task = state.tasks.find((t) => t.id === toggle.dataset.toggleTask);
      if (task) task.done = !task.done;
      render();
    }
    const del = e.target.closest("[data-delete-task]");
    if (del) {
      state.tasks = state.tasks.filter((t) => t.id !== del.dataset.deleteTask);
      render();
      toast("Task removed");
    }
    const gradeDel = e.target.closest("[data-delete-grade]");
    if (gradeDel) {
      state.grades = state.grades.filter(
        (g) => g.id !== gradeDel.dataset.deleteGrade,
      );
      state.gradesComputed = false;
      render();
      toast("Grade row removed");
    }
    const classDel = e.target.closest("[data-delete-class]");
    if (classDel) {
      state.classes = state.classes.filter(
        (c) => c.id !== classDel.dataset.deleteClass,
      );
      render();
      toast("Class removed");
    }
  });
  $$(".filter-tab").forEach((tab) =>
    tab.addEventListener("click", () => {
      $$(".filter-tab").forEach((t) =>
        t.classList.toggle("selected", t === tab),
      );
      renderTasks();
    }),
  );
  $("#expense-filter").addEventListener("change", renderExpenses);
  $("#grade-rows").addEventListener("change", (e) => {
    const field = e.target.closest("[data-grade-row]");
    if (!field) return;
    const row = state.grades.find((g) => g.id === field.dataset.gradeRow);
    if (row) {
      const property = field.dataset.gradeField;
      row[property] = property === "category"
        ? field.value
        : field.value === ""
          ? ""
          : Math.max(0, Number(field.value) || 0);
      if (property !== "category") {
        state.gradesComputed = false;
        $$(".grade-raw").forEach((cell) => (cell.textContent = "—"));
      }
      renderGradeSummary();
      persist();
    }
  });
  $("#add-grade-row").addEventListener("click", () => {
    state.grades.push({
      id: makeId(),
      category: GRADE_CATEGORIES[0],
      score: "",
      total: "",
    });
    state.gradesComputed = false;
    renderGrades();
    persist();
    $('#grade-rows tr:last-child [data-grade-field="score"]')?.focus();
  });
  $("#compute-grade").addEventListener("click", () => {
    state.gradesComputed = true;
    renderGrades();
    persist();
  });

  // 5. Shared entry dialog
  // Cancel and close only dismiss the dialog; the form submit handler is reserved for Save.
  const dialog = $("#entry-dialog"),
    form = $("#entry-form");
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-dialog]")) dialog.close();
  });
  function field(
    label,
    name,
    type = "text",
    value = "",
    options = null,
    extra = "",
  ) {
    if (options)
      return `<div class="dialog-field"><label for="field-${name}">${label}</label><select id="field-${name}" name="${name}" ${extra}>${options.map((o) => `<option value="${escapeHtml(o)}" ${o === value ? "selected" : ""}>${escapeHtml(o)}</option>`).join("")}</select></div>`;
    return `<div class="dialog-field"><label for="field-${name}">${label}</label><input id="field-${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" ${type === "number" ? 'min="0" step="1"' : ""} ${extra} required></div>`;
  }
  // One dialog builder supplies the fields and save action for each add/edit interaction.
  function openDialog(action) {
    const config = {
      "add-task": {
        title: "Add a task",
        subtitle: "A SMALL THING, DONE WELL",
        fields: `${field("What needs doing?", "title", "text", "", "", 'placeholder="e.g. Review lecture notes"')}<div class="dialog-grid">${field("Due", "due", "text", "Today · Anytime", "", 'placeholder="Today · 3:00 PM"')}${field("Priority", "priority", "text", "Medium", ["Low", "Medium", "High"])}</div>`,
        save: (data) =>
          state.tasks.unshift({
            id: makeId(),
            title: data.get("title").trim(),
            due: data.get("due").trim() || "Today",
            priority: data.get("priority"),
            done: false,
          }),
      },
      "add-expense": {
        title: "Add an expense",
        subtitle: "MONEY CHECK-IN",
        fields: `${field("What did you spend on?", "name", "text", "", "", 'placeholder="e.g. Lunch"')}<div class="dialog-grid">${field("Amount (₱)", "amount", "number", "", "", 'min="1"')}${field("Category", "category", "text", "Food", ["Food", "Transport", "School", "Personal", "Other"])}</div>${field("Date", "date", "date", today.toISOString().slice(0, 10))}`,
        save: (data) =>
          state.expenses.unshift({
            id: makeId(),
            name: data.get("name").trim(),
            amount: Number(data.get("amount")),
            category: data.get("category"),
            date: data.get("date"),
          }),
      },
      "add-class": {
        title: "Add a class",
        subtitle: "BUILD YOUR WEEK",
        fields: `${field("Subject", "name", "text", "", "", 'placeholder="e.g. Chemistry"')}<div class="dialog-grid">${field("Day", "day", "text", "Mon", DAYS)}${field("Start time", "time", "text", "9:00", ["8:00", "9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00", "4:00"])}</div>${field("Room or location", "room", "text", "", "", 'placeholder="e.g. Science Hall · 204"')}`,
        save: (data) =>
          state.classes.push({
            id: makeId(),
            day: data.get("day"),
            time: data.get("time"),
            name: data.get("name").trim(),
            room: data.get("room").trim() || "Room not set",
          }),
      },
      "edit-budget": {
        title: "Monthly allowance",
        subtitle: "SET YOUR MONTHLY PLAN",
        fields: field(
          "Allowance (₱)",
          "allowance",
          "number",
          state.allowance,
          "",
          'min="0"',
        ),
        save: (data) => (state.allowance = Number(data.get("allowance"))),
      },
    }[action];
    if (!config) return;
    $("#dialog-title").textContent = config.title;
    $("#dialog-eyebrow").textContent = config.subtitle;
    $("#dialog-fields").innerHTML = config.fields;
    form.onsubmit = (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      config.save(data);
      render();
      dialog.close();
      toast(
        action === "edit-budget"
          ? "Allowance updated"
          : "Added to your planner",
      );
    };
    dialog.showModal();
    setTimeout(() => $("#dialog-fields input")?.focus(), 30);
  }

  // 6. Reset and first page load
  $("#reset-data").addEventListener("click", () => {
    if (
      confirm(
        "Restore the original sample planner? Your current changes will be replaced.",
      )
    ) {
      state = structuredClone(seed);
      render();
      navigate("overview");
      toast("Sample planner restored");
    }
  });
  const initial = location.hash.replace("#", "");
  navigate(
    ["overview", "planner", "classes", "budget", "grades"].includes(initial)
      ? initial
      : "overview",
  );
  render();
})();
