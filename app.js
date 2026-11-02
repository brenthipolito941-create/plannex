(() => {
  // 1. Starter data and settings
  // These values set the first-run sample content and the timetable/grade options.
  const KEY = "plannex-student-planner-v1";
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const HOURS = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];
  const GRADE_CATEGORIES = ["Exam", "Performance Task", "Quiz", "Long Quiz", "Assignment"];
  const GRADE_SYSTEMS = ["0-Based Grading System", "50-Based Grading System"];
  const seed = {
    allowance: 12000,
    gradeWeights: {
      Exam: 40,
      "Performance Task": 40,
      Quiz: 10,
      "Long Quiz": 0,
      Assignment: 10,
    },
    gradingBase: 0,
    savedGrades: [],
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
      { id: "g6", category: "Performance Task", score: 28, total: 30 },
    ],
  };

  // 2. Saved state and small helpers
  // Short DOM helpers keep the render functions readable.
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  // Convert older 12-hour text values and new time-picker values to HH:mm.
  function normalizeClassTime(value) {
    const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!match) return "09:00";
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3]?.toUpperCase();
    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    // Earlier sample data used 1:00-4:00 to mean 1:00-4:00 PM.
    if (!period && match[1].length === 1 && hour >= 1 && hour <= 4) hour += 12;
    if (hour > 23 || minute > 59) return "09:00";
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }
  function addMinutesToTime(value, minutes) {
    const [hour, minute] = normalizeClassTime(value).split(":").map(Number);
    const total = Math.min(23 * 60 + 59, hour * 60 + minute + minutes);
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }
  // Classes need an end time for the live "Up next" card. Older saved classes default to one hour.
  function normalizeClassEndTime(start, end) {
    const startTime = normalizeClassTime(start);
    const fallback = addMinutesToTime(startTime, 60);
    if (!end) return fallback;
    const endTime = normalizeClassTime(end);
    return toMinutes(endTime) > toMinutes(startTime) ? endTime : fallback;
  }
  // A 0 base keeps the raw percentage; a 50% base maps it to 50 + (raw × 0.5).
  function convertGrade(rawGrade, base) {
    const baseValue = Number(base) === 50 ? 50 : 0;
    return baseValue + (Number(rawGrade) * (100 - baseValue)) / 100;
  }
  let state;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    state = saved ? { ...structuredClone(seed), ...saved } : structuredClone(seed);
    state.gradeWeights = { ...seed.gradeWeights, ...(state.gradeWeights || {}) };
    // Keep older saved planner data on the original 0-base scale by default.
    state.gradingBase = Number(state.gradingBase) === 50 ? 50 : 0;
    state.classes = (Array.isArray(state.classes) ? state.classes : structuredClone(seed.classes))
      .map((item) => {
        const time = normalizeClassTime(item.time);
        return { ...item, time, endTime: normalizeClassEndTime(time, item.endTime) };
      });
    state.savedGrades = (Array.isArray(state.savedGrades) ? state.savedGrades : [])
      .filter((grade) => grade && typeof grade === "object")
      .map((grade) => {
        const base = Number(grade.base) === 50 ? 50 : 0;
        const rawGrade = Number(grade.rawGrade ?? grade.grade) || 0;
        return {
          id: grade.id || `saved-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          subject: String(grade.subject || grade.name || "Untitled subject").trim() || "Untitled subject",
          rawGrade,
          grade: Number.isFinite(Number(grade.grade))
            ? Number(grade.grade)
            : convertGrade(rawGrade, base),
          base,
          gradedWeight: Number(grade.gradedWeight) || 0,
          savedAt: grade.savedAt || new Date().toISOString(),
        };
      });
    if (!Array.isArray(state.grades)) state.grades = structuredClone(seed.grades);
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
  // Format date and time inputs in the student's local time zone.
  const dateInputValue = (date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  };
  const timeInputValue = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
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

  // Prepare the alarm audio after the student enables a reminder by clicking.
  let reminderAudioContext = null;
  let reminderAlarmInterval = null;
  const activeReminderTasks = new Map();
  const activeReminderOscillators = new Set();
  function unlockReminderAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      reminderAudioContext ||= new AudioContextClass();
      if (reminderAudioContext.state === "suspended") {
        reminderAudioContext.resume().catch(() => {});
      }
    } catch {
      reminderAudioContext = null;
    }
  }
  function playReminderAlarm() {
    // A saved reminder may fire after a page reload, so prepare audio on demand too.
    if (!reminderAudioContext) unlockReminderAudio();
    if (!reminderAudioContext) return;
    try {
      if (reminderAudioContext.state === "suspended") {
        reminderAudioContext.resume().catch(() => {});
      }
      const startAt = reminderAudioContext.currentTime + 0.05;
      [0, 0.4, 0.8].forEach((offset) => {
        const oscillator = reminderAudioContext.createOscillator();
        const volume = reminderAudioContext.createGain();
        const noteStart = startAt + offset;
        oscillator.type = "sine";
        oscillator.frequency.value = 880;
        activeReminderOscillators.add(oscillator);
        oscillator.onended = () => activeReminderOscillators.delete(oscillator);
        volume.gain.setValueAtTime(0.0001, noteStart);
        volume.gain.exponentialRampToValueAtTime(0.25, noteStart + 0.03);
        volume.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.23);
        oscillator.connect(volume);
        volume.connect(reminderAudioContext.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 0.24);
      });
    } catch {
      // The notification can still work if audio playback is unavailable.
    }
  }
  function startReminderAlarm(tasks) {
    tasks.forEach((task) => activeReminderTasks.set(task.id, task.title));
    $("#reminder-description").textContent = activeReminderTasks.size === 1
      ? "This task needs your attention."
      : "These tasks need your attention.";
    $("#reminder-task-list").textContent = [...activeReminderTasks.values()]
      .map((title) => `• ${title}`)
      .join("\n");

    const reminderDialog = $("#reminder-dialog");
    if (!reminderDialog.open) reminderDialog.showModal();
    playReminderAlarm();
    // Repeat the chime until the student acknowledges the reminder.
    if (reminderAlarmInterval === null) {
      reminderAlarmInterval = setInterval(playReminderAlarm, 1600);
    }
  }
  function stopReminderAlarm() {
    if (reminderAlarmInterval !== null) clearInterval(reminderAlarmInterval);
    reminderAlarmInterval = null;
    activeReminderOscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // Ignore oscillators that already finished their chime.
      }
    });
    activeReminderOscillators.clear();
    activeReminderTasks.clear();
    $("#reminder-task-list").textContent = "";
    const reminderDialog = $("#reminder-dialog");
    if (reminderDialog.open) reminderDialog.close();
  }
  async function prepareTaskReminder(event) {
    const checkbox = event.target.closest('input[name="notify"]');
    if (!checkbox) return;
    const reminderFields = $("#task-reminder-fields");
    if (reminderFields) {
      reminderFields.classList.toggle("is-hidden", !checkbox.checked);
      reminderFields.querySelectorAll("input").forEach((input) => {
        input.disabled = !checkbox.checked;
      });
    }
    if (!checkbox.checked) return;
    unlockReminderAudio();
    if (!window.isSecureContext) {
      toast("Browser notifications need localhost or HTTPS. The in-page alarm works while Plannex is open.");
      return;
    }
    if (!("Notification" in window)) {
      toast("Desktop notifications are unavailable here. The in-page alarm works while Plannex is open.");
      return;
    }   
    if (Notification.permission === "default") {
      try {
        const permission = await Notification.requestPermission();
        toast(permission === "granted"
          ? "Notifications allowed. Keep Plannex open for task reminders."
          : "Notifications were not allowed. The in-page alarm works while Plannex is open.");
      } catch {
        toast("Browser notifications could not be enabled. The in-page alarm works while Plannex is open.");
      }
    } else if (Notification.permission === "denied") {
      toast("Allow notifications in browser settings to see desktop reminders.");
    }
  }

  // 3. Rendering helpers
  // These functions turn saved state into the cards, tables, and totals on screen.
  function formatTaskDate(value) {
    return new Date(`${value}T12:00:00`).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  function formatTaskTime(value) {
    return new Date(`1970-01-01T${value}:00`).toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  // Tasks with the nearest deadline come first; undated tasks stay at the end.
  function taskDueValue(task) {
    let dueDate = task.dueDate;
    let dueTime = task.dueTime;
    if (!dueDate && task.due) {
      const legacyTime = task.due.match(/\b\d{1,2}:\d{2}\s*(?:AM|PM)?\b/i)?.[0];
      if (legacyTime) {
        dueDate = dateInputValue(new Date());
        dueTime = normalizeClassTime(legacyTime);
      }
    }
    if (!dueDate) return Infinity;
    const due = new Date(`${dueDate}T${dueTime || "23:59"}`).getTime();
    return Number.isFinite(due) ? due : Infinity;
  }
  function sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
      const aDue = taskDueValue(a);
      const bDue = taskDueValue(b);
      if (aDue === bDue) return 0;
      return aDue - bDue;
    });
  }
  // Shared markup keeps task rows consistent on the dashboard and full planner page.
  function tasksMarkup(tasks, controls = true) {
    if (!tasks.length)
      return '<div class="empty-state">Nothing here just yet. Add a task when you’re ready.</div>';
    return tasks
      .map((task) => {
        const dueLabel = task.dueDate
          ? `${formatTaskDate(task.dueDate)}${task.dueTime ? ` · ${formatTaskTime(task.dueTime)}` : ""}`
          : task.due || "No due date";
        const reminderDate = task.reminderDate || task.dueDate;
        const reminderTime = task.reminderTime || task.dueTime;
        const reminderLabel = task.notify
          ? task.remindedAt
            ? " · Reminder sent"
            : reminderDate && reminderTime
              ? ` · Reminder ${formatTaskDate(reminderDate)} · ${formatTaskTime(reminderTime)}`
              : " · Reminder set"
          : "";
        return `<div class="task-row ${task.done ? "task-done" : ""}"><button class="check-button ${task.done ? "checked" : ""}" data-toggle-task="${task.id}" aria-label="${task.done ? "Mark incomplete" : "Mark complete"}">${task.done ? "✓" : ""}</button><div class="task-copy"><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(dueLabel)}${reminderLabel}</small></div><span class="priority ${(task.priority || "Medium").toLowerCase()}">${escapeHtml(task.priority || "Medium")}</span>${controls ? `<span class="task-actions"><button class="tiny-action" type="button" data-edit-task="${escapeHtml(task.id)}" aria-label="Edit ${escapeHtml(task.title)} task" title="Edit task">✎</button><button class="tiny-action" type="button" data-delete-task="${escapeHtml(task.id)}" aria-label="Delete ${escapeHtml(task.title)} task" title="Delete task">×</button></span>` : ""}</div>`;
      })
      .join("");
  }
  function checkTaskReminders() {
    const now = Date.now();
    const dueTasks = state.tasks.filter((task) => {
      const reminderDate = task.reminderDate || task.dueDate;
      const reminderTime = task.reminderTime || task.dueTime;
      if (task.done || !task.notify || task.remindedAt || !reminderDate || !reminderTime) {
        return false;
      }
      const reminderAt = new Date(`${reminderDate}T${reminderTime}`).getTime();
      return Number.isFinite(reminderAt) && reminderAt <= now;
    });
    if (!dueTasks.length) return;

    dueTasks.forEach((task) => {
      task.remindedAt = new Date().toISOString();
      if (!window.isSecureContext || !("Notification" in window) || Notification.permission !== "granted") {
        return;
      }
      try {
        const dueDetail = task.dueDate
          ? ` Due ${formatTaskDate(task.dueDate)}${task.dueTime ? ` at ${formatTaskTime(task.dueTime)}` : ""}.`
          : "";
        const notification = new Notification("Plannex task reminder", {
          body: `${task.title}.${dueDetail}`,
          icon: "assets/plannex-logo.png",
          tag: `plannex-task-${task.id}`,
        });
        notification.onclick = () => {
          window.focus();
          navigate("planner");
          notification.close();
        };
      } catch {
        // The in-page toast and alarm remain available if desktop alerts fail.
      }
    });
    startReminderAlarm(dueTasks);
    persist();
    renderTasks();
  }
  function startTaskReminderChecks() {
    // Check periodically while open, then catch up when the student returns to the tab.
    checkTaskReminders();
    setInterval(checkTaskReminders, 15000);
    // Reopen saved audio after the student's next interaction following a page reload.
    const unlockForPendingReminders = () => {
      const hasPendingReminder = state.tasks.some((task) => task.notify && !task.remindedAt);
      if (!hasPendingReminder && activeReminderTasks.size === 0) return;
      unlockReminderAudio();
      if (activeReminderTasks.size) playReminderAlarm();
      document.removeEventListener("pointerdown", unlockForPendingReminders);
      document.removeEventListener("keydown", unlockForPendingReminders);
    };
    document.addEventListener("pointerdown", unlockForPendingReminders);
    document.addEventListener("keydown", unlockForPendingReminders);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) checkTaskReminders();
    });
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
  // Convert the weighted raw percentage to the selected grading base.
  function applyGradingBase(rawGrade, base = state.gradingBase) {
    return convertGrade(rawGrade, base);
  }
  function getGradeWeightTotal() {
    return GRADE_CATEGORIES.reduce(
      (sum, category) => sum + (Number(state.gradeWeights[category]) || 0),
      0,
    );
  }
  function getGradedWeight() {
    return GRADE_CATEGORIES.reduce((sum, category) => {
      const hasScores = state.grades.some(
        (row) => row.category === category && getRowGrade(row) !== null,
      );
      return sum + (hasScores ? Number(state.gradeWeights[category]) || 0 : 0);
    }, 0);
  }
  // Weight each category's points average by the percentage from the syllabus.
  function getOverallRawGrade() {
    if (Math.abs(getGradeWeightTotal() - 100) > 0.01) return null;
    let weightedTotal = 0;
    let includedWeight = 0;
    for (const category of GRADE_CATEGORIES) {
      const weight = Number(state.gradeWeights[category]) || 0;
      const rows = state.grades.filter(
        (row) => row.category === category && getRowGrade(row) !== null,
      );
      if (!rows.length || weight <= 0) continue;
      const earned = rows.reduce((sum, row) => sum + Number(row.score), 0);
      const possible = rows.reduce((sum, row) => sum + Number(row.total), 0);
      if (possible <= 0) continue;
      weightedTotal += (earned / possible) * 100 * weight;
      includedWeight += weight;
    }
    return includedWeight > 0 ? weightedTotal / includedWeight : null;
  }
  function renderTasks() {
    const sorted = sortTasks(state.tasks);
    const remaining = state.tasks.filter((t) => !t.done).length,
      done = state.tasks.length - remaining;
    $("#stat-tasks").innerHTML =
      `${remaining} <small>${remaining === 1 ? "task" : "tasks"} left</small>`;
    $("#today-count").textContent = remaining;
    $("#planner-count").textContent = remaining;
    $("#task-foot").textContent = state.tasks.length
      ? `${done} of ${state.tasks.length} completed`
      : "Add a task to get started";
    $("#task-progress").style.width =
      `${state.tasks.length ? (done / state.tasks.length) * 100 : 0}%`;
    $("#overview-tasks").innerHTML = tasksMarkup(sorted);
    const filter = $(".filter-tab.selected")?.dataset.filter || "all";
    $("#planner-tasks").innerHTML = tasksMarkup(
      sorted.filter(
        (t) => filter === "all" || (filter === "open" ? !t.done : t.done),
      ),
    );
  }
  function renderBudget() {
    const allowance = Number(state.allowance) || 0;
    const spent = state.expenses.reduce((sum, e) => sum + Number(e.amount), 0),
      remaining = allowance - spent,
      ratio =
        allowance > 0
          ? Math.min(100, (spent / allowance) * 100)
          : 100;
    // Convert a monthly allowance into an average weekly target across 52 weeks.
    const weekStart = new Date(today);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const dateKey = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const weekStartKey = dateKey(weekStart),
      weekEndKey = dateKey(weekEnd),
      weeklyTarget = (allowance * 12) / 52,
      weeklySpent = state.expenses.reduce(
        (sum, expense) =>
          expense.date >= weekStartKey && expense.date <= weekEndKey
            ? sum + (Number(expense.amount) || 0)
            : sum,
        0,
      ),
      weeklyLeft = weeklyTarget - weeklySpent;
    const formatWeekDate = (date) =>
      date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
    $("#budget-week-range").textContent =
      `${formatWeekDate(weekStart)} – ${formatWeekDate(weekEnd)}`;
    $("#budget-week-target").textContent = money(weeklyTarget);
    $("#budget-week-spent").textContent = money(weeklySpent);
    $("#budget-week-left").textContent = money(weeklyLeft);
    $("#budget-week-left").style.color = weeklyLeft < 0 ? "#ce8065" : "";
    $("#stat-budget").textContent = money(remaining);
    $("#budget-foot").textContent =
      `of your ${money(allowance)} monthly allowance`;
    $("#overview-spent").textContent = money(spent);
    $("#spent-label").textContent = `${money(spent)} spent`;
    $("#limit-label").textContent = `${money(allowance)} limit`;
    $("#budget-bar").style.width = `${ratio}%`;
    $("#budget-total").textContent = money(allowance);
    $("#budget-spent").textContent = money(spent);
    $("#budget-remaining").textContent = money(remaining);
    $("#budget-remaining").style.color = remaining < 0 ? "#ce8065" : "";
    $("#budget-remaining-note").textContent =
      remaining < 0 ? "Over your monthly allowance" : "You’re doing great";
    $("#rule-allowance").textContent = money(allowance);
    $("#rule-needs").textContent = money(allowance * 0.5);
    $("#rule-wants").textContent = money(allowance * 0.3);
    $("#rule-savings").textContent = money(allowance * 0.2);
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
              `<div class="expense-row"><span class="expense-icon">${icons[e.category] || "·"}</span><span class="expense-copy"><strong>${escapeHtml(e.name)}</strong><small>${new Date(`${e.date}T12:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</small></span><span class="expense-category">${escapeHtml(e.category)}</span><span class="expense-amount">−${money(e.amount)}</span><span class="expense-actions"><button class="expense-action" type="button" data-edit-expense="${escapeHtml(e.id)}" aria-label="Edit ${escapeHtml(e.name)} expense" title="Edit expense">✎</button><button class="expense-action expense-remove" type="button" data-delete-expense="${escapeHtml(e.id)}" aria-label="Remove ${escapeHtml(e.name)} expense" title="Remove expense">×</button></span></div>`,
          )
          .join("")
      : '<div class="empty-state">No expenses in this category.</div>';
  }
  function formatPercent(value) {
    return `${Number(Number(value).toFixed(1))}%`;
  }
  function formatSavedGradeDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  }
  function savedGradeTime(savedGrade) {
    const time = new Date(savedGrade.savedAt).getTime();
    return Number.isFinite(time) ? time : 0;
  }
  function gradeSystemLabel(base) {
    return Number(base) === 50 ? GRADE_SYSTEMS[1] : GRADE_SYSTEMS[0];
  }
  function savedGradeMarkup(grades, controls = false) {
    if (!grades.length) {
      return '<div class="empty-state saved-grades-empty">No saved grades yet. Compute a subject grade in the Grade Calculator, then choose <strong>Save grade</strong> to keep it here.</div>';
    }
    return grades.map((savedGrade) => {
      const base = Number(savedGrade.base) === 50 ? 50 : 0;
      const rawGrade = Number(savedGrade.rawGrade) || 0;
      const finalGrade = convertGrade(rawGrade, base);
      const savedDate = formatSavedGradeDate(savedGrade.savedAt);
      const detail = base === 50
        ? `Final ${formatPercent(finalGrade)} on the 50-based scale${savedDate ? ` · Saved ${savedDate}` : ""}`
        : `0-based scale${savedDate ? ` · Saved ${savedDate}` : ""}`;
      return `<div class="saved-grade-row"><span class="saved-grade-mark" aria-hidden="true">✳</span><span class="saved-grade-copy"><strong>${escapeHtml(savedGrade.subject)}</strong><small>${escapeHtml(detail)}</small></span><span class="grade-system-badge base-${base}" title="${escapeHtml(gradeSystemLabel(base))}">${base}-BASED</span><span class="saved-grade-score"><strong>${formatPercent(rawGrade)}</strong><small>raw</small></span>${controls ? `<span class="saved-grade-actions"><button class="saved-grade-action" type="button" data-edit-saved-grade="${escapeHtml(savedGrade.id)}" aria-label="Edit ${escapeHtml(savedGrade.subject)} saved grade" title="Edit saved grade">✎</button><button class="saved-grade-action saved-grade-remove" type="button" data-delete-saved-grade="${escapeHtml(savedGrade.id)}" aria-label="Remove ${escapeHtml(savedGrade.subject)} saved grade" title="Remove saved grade">×</button></span>` : ""}</div>`;
    }).join("");
  }
  function renderSavedGrades() {
    const grades = [...state.savedGrades].sort((a, b) => savedGradeTime(b) - savedGradeTime(a));
    $("#overview-saved-grades").innerHTML = savedGradeMarkup(grades);
    $("#overview-saved-count").textContent = grades.length;
    $("#saved-grade-list").innerHTML = savedGradeMarkup(grades, true);
    $("#saved-grade-count").textContent = `${grades.length} saved`;
    const averageRaw = grades.length
      ? grades.reduce((sum, grade) => sum + (Number(grade.rawGrade) || 0), 0) / grades.length
      : null;
    $("#stat-grade").innerHTML =
      averageRaw === null ? "— <small>%</small>" : `${averageRaw.toFixed(1)}<small>%</small>`;
    $("#grade-foot").textContent = averageRaw === null
      ? "Save a grade from the calculator"
      : `Average raw score across ${grades.length} saved ${grades.length === 1 ? "subject" : "subjects"}`;
  }
  function renderGradeWeights() {
    $("#grade-weights").innerHTML = GRADE_CATEGORIES.map((category, index) => {
      const inputId = `grade-weight-${index}`;
      return `<div class="grade-weight-card"><label for="${inputId}">${escapeHtml(category)}</label><div class="grade-weight-input-wrap"><input id="${inputId}" type="number" min="0" max="100" step="0.1" value="${escapeHtml(state.gradeWeights[category] ?? 0)}" data-grade-weight="${escapeHtml(category)}" aria-label="${escapeHtml(category)} weight percentage"><span>%</span></div></div>`;
    }).join("");
  }
  function renderGradeSummary() {
    const weightTotal = getGradeWeightTotal();
    const weightsValid = Math.abs(weightTotal - 100) <= 0.01;
    const gradedWeight = getGradedWeight();
    const rawAvg = state.gradesComputed && weightsValid ? getOverallRawGrade() : null;
    const avg = rawAvg === null ? null : applyGradingBase(rawAvg);
    $("#grade-base").value = String(state.gradingBase);
    $("#grade-weight-total").textContent = formatPercent(weightTotal);
    $("#grade-weight-status").textContent = weightsValid
      ? gradedWeight > 0
        ? `Weights total 100%. Scores currently cover ${formatPercent(gradedWeight)} of the course weight.`
        : "Weights total 100%. Add scores in one or more weighted categories."
      : `Weights total ${formatPercent(weightTotal)}. Adjust them to 100% before calculating.`;
    $("#grade-weight-status").classList.toggle("is-valid", weightsValid);
    $("#grade-actions-default").classList.toggle("is-hidden", avg !== null);
    $("#grade-actions-result").classList.toggle("is-hidden", avg === null);
    $("#grade-average").innerHTML =
      avg === null ? "—<small>%</small>" : `${avg.toFixed(1)}<small>%</small>`;
    const resultMessage = avg >= 90
      ? "Excellent work — your effort is showing."
      : avg >= 75
        ? "You’re making steady progress. Keep going."
        : "Use this result to guide your next study session.";
    $("#grade-caption").textContent = avg === null
      ? weightsValid
        ? "Enter scores and totals, then compute your weighted grade."
        : "Set category weights that add up to 100% before calculating."
      : `Weighted raw score ${rawAvg.toFixed(1)}% → ${formatPercent(avg)} with a ${state.gradingBase === 50 ? "50%" : "0"} base. Scores cover ${formatPercent(gradedWeight)} of your course weight. ${resultMessage}`;
    $("#grade-count").textContent =
      `${state.grades.length} ${state.grades.length === 1 ? "row" : "rows"}`;
  }
  function renderGrades() {
    renderGradeWeights();
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
  // Compare class times as minutes after midnight so custom times sort correctly.
  function toMinutes(time) {
    const [hour, minute] = normalizeClassTime(time).split(":").map(Number);
    return hour * 60 + minute;
  }
  function formatTime(time) {
    const [hour, minute] = normalizeClassTime(time).split(":").map(Number);
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
  }
  function dayCode(date = new Date()) {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
  }
  // Find the current class first, then the next class that has not started today.
  function getNextClassState(now = new Date()) {
    const todayCode = dayCode(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const todaysClasses = state.classes
      .filter((item) => item.day === todayCode)
      .map((item) => {
        const startTime = normalizeClassTime(item.time);
        const endTime = normalizeClassEndTime(startTime, item.endTime);
        return {
          ...item,
          startTime,
          endTime,
          startMinutes: toMinutes(startTime),
          endMinutes: toMinutes(endTime),
        };
      })
      .sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);
    const current = todaysClasses.find(
      (item) => nowMinutes >= item.startMinutes && nowMinutes < item.endMinutes,
    );
    if (current) {
      const following = todaysClasses.find((item) => item.startMinutes > current.startMinutes);
      return { status: "now", item: current, following: following || null };
    }
    const upcoming = todaysClasses.find((item) => item.startMinutes > nowMinutes);
    if (upcoming) {
      const following = todaysClasses.find((item) => item.startMinutes > upcoming.startMinutes);
      return { status: "next", item: upcoming, following: following || null };
    }
    return {
      status: todaysClasses.length ? "done" : state.classes.length ? "none-today" : "empty",
      item: null,
      following: null,
    };
  }
  function classCardMarkup(item, status) {
    const room = String(item.room || "").trim();
    return `<div class="class-card${status === "NOW" ? " class-now" : ""}"><span class="class-time"><strong>${escapeHtml(formatTime(item.startTime))}</strong><small>to ${escapeHtml(formatTime(item.endTime))}</small></span><span class="class-stripe"></span><span class="class-info"><strong>${escapeHtml(item.name)}</strong>${room && room !== "Room not set" ? `<small>${escapeHtml(room)}</small>` : ""}</span><span class="class-status">${status}</span></div>`;
  }
  // Keep the following class as a small hint so the main Up Next card stays in focus.
  function followingClassMarkup(item, label) {
    const room = String(item.room || "").trim();
    return `<div class="class-following"><span class="class-following-label">${label}</span><span class="class-following-time">${escapeHtml(formatTime(item.startTime))} – ${escapeHtml(formatTime(item.endTime))}</span><span class="class-following-info"><strong>${escapeHtml(item.name)}</strong>${room && room !== "Room not set" ? `<small>${escapeHtml(room)}</small>` : ""}</span></div>`;
  }
  function renderNextClass() {
    const now = new Date();
    const result = getNextClassState(now);
    const next = $("#next-class");
    const item = result.item;
    const following = result.following;
    const signature = `${dayCode(now)}:${result.status}:${item?.id || ""}:${item?.name || ""}:${item?.startTime || ""}:${item?.endTime || ""}:${item?.room || ""}:${following?.id || ""}:${following?.name || ""}:${following?.startTime || ""}:${following?.endTime || ""}:${following?.room || ""}`;
    // Avoid rebuilding the cards unless the classes (or their saved details) actually change.
    if (next.dataset.signature === signature) return;
    next.dataset.signature = signature;
    if (!item) {
      next.innerHTML = `<div class="no-class">${
        result.status === "empty"
          ? "No classes on your timetable yet. Add a class to see what’s up next."
          : result.status === "none-today"
            ? "No classes scheduled today. Enjoy your day."
            : "No more classes today. Take a breather."
      }</div>`;
      return;
    }
    const followingMarkup = following
      ? followingClassMarkup(following, result.status === "now" ? "UP NEXT" : "THEN")
      : "";
    next.innerHTML = `${classCardMarkup(item, result.status === "now" ? "NOW" : "UP NEXT")}${followingMarkup}<div class="no-class">${result.status === "now" ? "Class in progress right now." : "Your next class today."}</div>`;
  }
  function renderClasses() {
    const grid = $("#timetable");
    grid.innerHTML = `<div class="time-head">TIME</div>${DAYS.map((d) => `<div class="day-head">${d.toUpperCase()}</div>`).join("")}`;
    const classTimes = [...new Set([
      ...HOURS,
      ...state.classes.map((item) => normalizeClassTime(item.time)),
    ])].sort((a, b) => toMinutes(a) - toMinutes(b));
    for (const time of classTimes) {
      grid.insertAdjacentHTML(
        "beforeend",
        `<div class="time-slot">${formatTime(time)}</div>`,
      );
      for (const day of DAYS) {
        const items = state.classes.filter(
          (item) => item.day === day && normalizeClassTime(item.time) === time,
        );
        const blocks = items.map((item) =>
          `<div class="class-block"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(formatTime(item.time))} · ${escapeHtml(item.room)}</small><div class="class-actions"><button class="class-action" type="button" data-edit-class="${escapeHtml(item.id)}" aria-label="Edit ${escapeHtml(item.name)} class" title="Edit class">✎</button><button class="class-action" type="button" data-delete-class="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.name)} class" title="Remove class">×</button></div></div>`,
        ).join("");
        grid.insertAdjacentHTML(
          "beforeend",
          `<div class="class-slot">${blocks}</div>`,
        );
      }
    }
    renderNextClass();
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
    renderSavedGrades();
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
  // Sidebar links and the logo both use the app's page navigation.
  $$(".nav-link, .brand, .text-link").forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.dataset.page || "overview");
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
    const taskEdit = e.target.closest("[data-edit-task]");
    if (taskEdit) openDialog("edit-task", taskEdit.dataset.editTask);
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
    const savedGradeEdit = e.target.closest("[data-edit-saved-grade]");
    if (savedGradeEdit) {
      openDialog("edit-saved-grade", savedGradeEdit.dataset.editSavedGrade);
    }
    const savedGradeDel = e.target.closest("[data-delete-saved-grade]");
    if (savedGradeDel) {
      state.savedGrades = state.savedGrades.filter(
        (grade) => grade.id !== savedGradeDel.dataset.deleteSavedGrade,
      );
      render();
      toast("Saved grade removed");
    }
    const expenseEdit = e.target.closest("[data-edit-expense]");
    if (expenseEdit) openDialog("edit-expense", expenseEdit.dataset.editExpense);
    const expenseDel = e.target.closest("[data-delete-expense]");
    if (expenseDel) {
      state.expenses = state.expenses.filter(
        (expense) => expense.id !== expenseDel.dataset.deleteExpense,
      );
      render();
      toast("Expense removed");
    }
    const classEdit = e.target.closest("[data-edit-class]");
    if (classEdit) openDialog("edit-class", classEdit.dataset.editClass);
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
  $("#grade-weights").addEventListener("change", (e) => {
    const input = e.target.closest("[data-grade-weight]");
    if (!input) return;
    const category = input.dataset.gradeWeight;
    state.gradeWeights[category] = input.value === ""
      ? ""
      : Math.min(100, Math.max(0, Number(input.value) || 0));
    state.gradesComputed = false;
    renderGradeSummary();
    persist();
  });
  $("#grade-base").addEventListener("change", (e) => {
    state.gradingBase = Number(e.target.value) === 50 ? 50 : 0;
    renderGradeSummary();
    persist();
  });
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
      state.gradesComputed = false;
      if (property !== "category") {
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
    if (Math.abs(getGradeWeightTotal() - 100) > 0.01) {
      state.gradesComputed = false;
      renderGradeSummary();
      toast("Adjust category weights until they total 100%");
      return;
    }
    if (getGradedWeight() <= 0) {
      toast("Enter a score in a category with a weight above 0%");
      return;
    }
    state.gradesComputed = true;
    renderGrades();
    persist();
  });
  $("#save-grade").addEventListener("click", () => openDialog("save-grade"));
  $("#compute-again").addEventListener("click", () => {
    state.gradesComputed = false;
    renderGrades();
    persist();
    toast("Edit your scores, then compute a new grade");
    $('#grade-rows [data-grade-field="score"]')?.focus();
  });

  // 5. Shared entry dialog
  // Cancel and close only dismiss the dialog; the form submit handler is reserved for Save.
  const dialog = $("#entry-dialog"),
    form = $("#entry-form");
  $("#dialog-fields").addEventListener("change", prepareTaskReminder);
  $("#dialog-fields").addEventListener("change", (event) => {
    if (event.target.closest("#field-gradingSystem")) updateSaveGradePreview();
    const startInput = event.target.closest("#field-time");
    const endInput = $("#field-endTime");
    if (startInput && endInput && toMinutes(endInput.value) <= toMinutes(startInput.value)) {
      endInput.value = addMinutesToTime(startInput.value, 60);
    }
  });
  $("#reminder-okay").addEventListener("click", stopReminderAlarm);
  $("#reminder-dialog").addEventListener("cancel", (event) => {
    // The alarm dialog can only be dismissed with its Okay button.
    event.preventDefault();
  });
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
    required = true,
  ) {
    if (options)
      return `<div class="dialog-field"><label for="field-${name}">${label}</label><select id="field-${name}" name="${name}" ${extra}>${options.map((o) => `<option value="${escapeHtml(o)}" ${o === value ? "selected" : ""}>${escapeHtml(o)}</option>`).join("")}</select></div>`;
    return `<div class="dialog-field"><label for="field-${name}">${label}</label><input id="field-${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" ${type === "number" ? 'min="0" step="1"' : ""} ${extra} ${required ? "required" : ""}></div>`;
  }
  function showDialogMessage(message) {
    const node = $("#dialog-message");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
  }
  function updateSaveGradePreview() {
    const preview = $("#dialog-fields [data-save-grade-preview]");
    if (!preview) return;
    const rawValue = preview.dataset.rawGrade;
    const rawGrade = rawValue === "" ? null : Number(rawValue);
    const base = $("#field-gradingSystem")?.value.startsWith("50") ? 50 : 0;
    const finalNode = preview.querySelector("[data-save-grade-final]");
    const systemNode = preview.querySelector("[data-save-grade-system]");
    if (finalNode) {
      finalNode.textContent = rawGrade === null ? "—" : formatPercent(convertGrade(rawGrade, base));
    }
    if (systemNode) systemNode.textContent = `${base}-based`;
  }
  // One dialog builder supplies the fields and save action for each add/edit interaction.
  function openDialog(action, recordId = null) {
    const defaultTaskDue = new Date();
    defaultTaskDue.setHours(defaultTaskDue.getHours() + 1, 0, 0, 0);
    const editingTask = action === "edit-task"
      ? state.tasks.find((task) => task.id === recordId)
      : null;
    const editingExpense = action === "edit-expense"
      ? state.expenses.find((expense) => expense.id === recordId)
      : null;
    const editingClass = action === "edit-class"
      ? state.classes.find((item) => item.id === recordId)
      : null;
    const editingSavedGrade = action === "edit-saved-grade"
      ? state.savedGrades.find((grade) => grade.id === recordId)
      : null;
    if ((action === "edit-task" && !editingTask) ||
        (action === "edit-expense" && !editingExpense) ||
        (action === "edit-class" && !editingClass) ||
        (action === "edit-saved-grade" && !editingSavedGrade)) return;

    // Reuse the same labeled fields for adding and editing each planner entry.
    const taskFields = (task = null) => {
      const legacyTime = task?.due?.match(/\b\d{1,2}:\d{2}\s*(?:AM|PM)\b/i)?.[0];
      const fallbackDue = task ? new Date() : defaultTaskDue;
      const dueDate = task?.dueDate || dateInputValue(fallbackDue);
      const dueTime = task?.dueTime || (legacyTime ? normalizeClassTime(legacyTime) : timeInputValue(fallbackDue));
      const reminderDate = task?.reminderDate || dueDate;
      const reminderTime = task?.reminderTime || dueTime;
      const reminderDisabled = task?.notify ? "" : "disabled";
      const minDate = task ? "" : `min="${dateInputValue(new Date())}"`;
      return `${field("What needs doing?", "title", "text", task?.title || "", "", 'placeholder="e.g. Review lecture notes"')}<div class="dialog-grid">${field("Due date", "dueDate", "date", dueDate, "", minDate)}${field("Due time", "dueTime", "time", dueTime)}</div>${field("Priority", "priority", "text", task?.priority || "Medium", ["Low", "Medium", "High"])}<div class="task-reminder-option"><label for="field-notify"><input id="field-notify" name="notify" type="checkbox" ${task?.notify ? "checked" : ""}><span>Remind me with a notification and alarm</span></label><small>Choose a reminder time below. It can be earlier than the due time. Desktop alerts need browser permission.</small></div><div class="dialog-grid task-reminder-fields ${task?.notify ? "" : "is-hidden"}" id="task-reminder-fields">${field("Reminder date", "reminderDate", "date", reminderDate, "", reminderDisabled)}${field("Reminder time", "reminderTime", "time", reminderTime, "", reminderDisabled)}</div>`;
    };
    const expenseFields = (expense = null) =>
      `${field("What did you spend on?", "name", "text", expense?.name || "", "", 'placeholder="e.g. Lunch"')}<div class="dialog-grid">${field("Amount (₱)", "amount", "number", expense?.amount ?? "", "", 'min="1"')}${field("Category", "category", "text", expense?.category || "Food", ["Food", "Transport", "School", "Personal", "Other"])}</div>${field("Date", "date", "date", expense?.date || dateInputValue(new Date()))}`;
    const classFields = (item = null) => {
      const startTime = item ? normalizeClassTime(item.time) : "09:00";
      const endTime = item ? normalizeClassEndTime(startTime, item.endTime) : addMinutesToTime(startTime, 60);
      return `${field("Subject", "name", "text", item?.name || "", "", 'placeholder="e.g. Chemistry"')}<div class="dialog-grid">${field("Day", "day", "text", item?.day || "Mon", DAYS)}${field("Start time", "time", "time", startTime)}</div><div class="dialog-grid">${field("End time", "endTime", "time", endTime)}${field("Room or location", "room", "text", item?.room || "", "", 'placeholder="e.g. Science Hall · 204"', false)}</div>`;
    };
    const savedGradeFields = (savedGrade = null) => {
      const base = Number(savedGrade ? savedGrade.base : state.gradingBase) === 50 ? 50 : 0;
      const rawGrade = savedGrade ? Number(savedGrade.rawGrade) || 0 : getOverallRawGrade();
      const preview = savedGrade
        ? ""
        : `<div class="save-grade-preview" data-save-grade-preview data-raw-grade="${rawGrade ?? ""}"><span><small>COMPUTED RAW GRADE</small><strong>${rawGrade === null ? "—" : formatPercent(rawGrade)}</strong></span><span><small>GRADE TO SAVE</small><strong data-save-grade-final>${rawGrade === null ? "—" : formatPercent(convertGrade(rawGrade, base))}</strong><em data-save-grade-system>${base}-based</em></span></div>`;
      return `${preview}${field("Subject name", "subject", "text", savedGrade?.subject || "", "", 'placeholder="e.g. Biology 101"')}${field("Grading system", "gradingSystem", "text", gradeSystemLabel(base), GRADE_SYSTEMS)}<p class="saved-grade-dialog-note">${savedGrade ? `The saved raw grade stays ${formatPercent(rawGrade)}. Changing the grading system updates the converted final grade.` : "Saving is optional. You can keep computing grades without saving them."}</p>`;
    };

    const config = {
      "add-task": {
        title: "Add a task",
        subtitle: "A SMALL THING, DONE WELL",
        fields: taskFields(),
        save: (data) => state.tasks.unshift({
          id: makeId(),
          title: data.get("title").trim(),
          dueDate: data.get("dueDate"),
          dueTime: data.get("dueTime"),
          reminderDate: data.get("reminderDate") || data.get("dueDate"),
          reminderTime: data.get("reminderTime") || data.get("dueTime"),
          notify: data.get("notify") === "on",
          remindedAt: null,
          priority: data.get("priority"),
          done: false,
        }),
      },
      "edit-task": editingTask ? {
        title: "Edit task",
        subtitle: "UPDATE YOUR PLAN",
        fields: taskFields(editingTask),
        successMessage: "Task updated",
        save: (data) => {
          const notify = data.get("notify") === "on";
          const dueDate = data.get("dueDate");
          const dueTime = data.get("dueTime");
          const reminderDate = data.get("reminderDate") || dueDate;
          const reminderTime = data.get("reminderTime") || dueTime;
          const reminderChanged = editingTask.dueDate !== dueDate ||
            editingTask.dueTime !== dueTime ||
            editingTask.reminderDate !== reminderDate ||
            editingTask.reminderTime !== reminderTime ||
            Boolean(editingTask.notify) !== notify;
          Object.assign(editingTask, {
            title: data.get("title").trim(),
            due: "",
            dueDate,
            dueTime,
            reminderDate,
            reminderTime,
            notify,
            remindedAt: reminderChanged ? null : editingTask.remindedAt,
            priority: data.get("priority"),
          });
        },
      } : null,
      "add-expense": {
        title: "Add an expense",
        subtitle: "MONEY CHECK-IN",
        fields: expenseFields(),
        save: (data) => state.expenses.unshift({
          id: makeId(),
          name: data.get("name").trim(),
          amount: Number(data.get("amount")),
          category: data.get("category"),
          date: data.get("date"),
        }),
      },
      "edit-expense": editingExpense ? {
        title: "Edit expense",
        subtitle: "UPDATE YOUR SPENDING",
        fields: expenseFields(editingExpense),
        successMessage: "Expense updated",
        save: (data) => Object.assign(editingExpense, {
          name: data.get("name").trim(),
          amount: Number(data.get("amount")),
          category: data.get("category"),
          date: data.get("date"),
        }),
      } : null,
      "add-class": {
        title: "Add a class",
        subtitle: "BUILD YOUR WEEK",
        fields: classFields(),
        save: (data) => {
          const time = normalizeClassTime(data.get("time"));
          state.classes.push({
            id: makeId(),
            day: data.get("day"),
            time,
            endTime: normalizeClassEndTime(time, data.get("endTime")),
            name: data.get("name").trim(),
            room: data.get("room").trim() || "Room not set",
          });
        },
      },
      "edit-class": editingClass ? {
        title: "Edit class",
        subtitle: "UPDATE YOUR SCHEDULE",
        fields: classFields(editingClass),
        successMessage: "Class updated",
        save: (data) => {
          const time = normalizeClassTime(data.get("time"));
          Object.assign(editingClass, {
            day: data.get("day"),
            time,
            endTime: normalizeClassEndTime(time, data.get("endTime")),
            name: data.get("name").trim(),
            room: data.get("room").trim() || "Room not set",
          });
        },
      } : null,
      "save-grade": {
        title: "Save computed grade",
        subtitle: "KEEP THIS RESULT",
        fields: savedGradeFields(),
        save: (data) => {
          const rawGrade = getOverallRawGrade();
          if (rawGrade === null) {
            showDialogMessage("Compute a grade before saving it.");
            return false;
          }
          const subject = String(data.get("subject") || "").trim();
          if (!subject) {
            showDialogMessage("Enter a subject name before saving.");
            return false;
          }
          const base = String(data.get("gradingSystem") || "").startsWith("50") ? 50 : 0;
          const existing = state.savedGrades.find(
            (saved) => saved.subject.trim().toLowerCase() === subject.toLowerCase(),
          );
          if (existing) {
            if (Number(existing.base) === base && Math.abs(Number(existing.rawGrade) - rawGrade) < 0.05) {
              showDialogMessage(`${subject} is already saved with this result. Edit or remove it from your saved grades.`);
              return false;
            }
            if (!confirm(`${subject} already has a saved grade. Replace it with this new result?`)) {
              return false;
            }
            Object.assign(existing, {
              subject,
              rawGrade,
              grade: convertGrade(rawGrade, base),
              base,
              gradedWeight: getGradedWeight(),
              savedAt: new Date().toISOString(),
            });
            return "Saved grade updated";
          }
          state.savedGrades.unshift({
            id: makeId(),
            subject,
            rawGrade,
            grade: convertGrade(rawGrade, base),
            base,
            gradedWeight: getGradedWeight(),
            savedAt: new Date().toISOString(),
          });
          return "Grade saved to your subjects";
        },
      },
      "edit-saved-grade": editingSavedGrade ? {
        title: "Edit saved grade",
        subtitle: "UPDATE THIS SUBJECT",
        fields: savedGradeFields(editingSavedGrade),
        successMessage: "Saved grade updated",
        save: (data) => {
          const subject = String(data.get("subject") || "").trim();
          if (!subject) {
            showDialogMessage("Enter a subject name before saving.");
            return false;
          }
          const base = String(data.get("gradingSystem") || "").startsWith("50") ? 50 : 0;
          const duplicate = state.savedGrades.find(
            (saved) => saved.id !== editingSavedGrade.id &&
              saved.subject.trim().toLowerCase() === subject.toLowerCase(),
          );
          if (duplicate) {
            showDialogMessage(`${subject} is already in your saved grades.`);
            return false;
          }
          Object.assign(editingSavedGrade, {
            subject,
            base,
            grade: convertGrade(Number(editingSavedGrade.rawGrade) || 0, base),
          });
          return "Saved grade updated";
        },
      } : null,
      "edit-budget": {
        title: "Monthly allowance",
        subtitle: "SET YOUR MONTHLY PLAN",
        fields: field("Allowance (₱)", "allowance", "number", state.allowance, "", 'min="0"'),
        successMessage: "Allowance updated",
        save: (data) => (state.allowance = Number(data.get("allowance"))),
      },
    }[action];
    if (!config) return;
    $("#dialog-title").textContent = config.title;
    $("#dialog-eyebrow").textContent = config.subtitle;
    $("#dialog-fields").innerHTML = config.fields;
    $("#dialog-message").textContent = "";
    $("#dialog-message").classList.remove("show");
    form.onsubmit = (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const saveResult = config.save(data);
      if (saveResult === false) return;
      render();
      dialog.close();
      toast(typeof saveResult === "string" ? saveResult : config.successMessage || "Added to your planner");
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
  startTaskReminderChecks();
  // Keep "Up next" current while the page stays open, then refresh it on return.
  setInterval(renderNextClass, 30000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) renderNextClass();
  });
})();
