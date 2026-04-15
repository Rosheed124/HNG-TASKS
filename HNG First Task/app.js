/**
 * HNG Frontend Cohort — Stage 0
 * Todo Card — Interactive Logic
 *
 * Handles:
 *  - Time-remaining calculation & live updates (every 60s)
 *  - Checkbox toggle (strikethrough, status change)
 *  - Edit / Delete button actions
 */

/* ── CONFIG ─────────────────────────────────────────────────── */
const DUE_DATE = new Date("2026-05-01T18:00:00Z"); // fixed due date

/* ── DOM REFS ───────────────────────────────────────────────── */
const card          = document.querySelector('[data-testid="test-todo-card"]');
const checkbox      = document.querySelector('[data-testid="test-todo-complete-toggle"]');
const titleEl       = document.querySelector('[data-testid="test-todo-title"]');
const statusBadge   = document.querySelector('[data-testid="test-todo-status"]');
const timeRemaining = document.getElementById("time-remaining-text");
const editBtn       = document.querySelector('[data-testid="test-todo-edit-button"]');
const deleteBtn     = document.querySelector('[data-testid="test-todo-delete-button"]');

/* ── TIME REMAINING ─────────────────────────────────────────── */
/**
 * Returns a friendly, human-readable string describing how far
 * away (or how long past) the due date is.
 * @param {Date} due
 * @returns {{ text: string, state: "overdue"|"due-soon"|"future"|"done" }}
 */
function getTimeRemaining(due) {
  const now      = Date.now();
  const diffMs   = due.getTime() - now;
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHrs  = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHrs  / 24);

  if (diffSecs <= 0) {
    // Overdue
    const absSecs = Math.abs(diffSecs);
    const absMins = Math.round(absSecs / 60);
    const absHrs  = Math.round(absMins / 60);
    const absDays = Math.round(absHrs  / 24);

    if (absSecs < 60)  return { text: "Due now!",               state: "overdue" };
    if (absMins < 60)  return { text: `Overdue by ${absMins} min${absMins !== 1 ? "s" : ""}`, state: "overdue" };
    if (absHrs  < 24)  return { text: `Overdue by ${absHrs} hour${absHrs !== 1 ? "s" : ""}`,  state: "overdue" };
                       return { text: `Overdue by ${absDays} day${absDays !== 1 ? "s" : ""}`,  state: "overdue" };
  }

  // Future
  if (diffMins < 5)   return { text: "Due now!",          state: "due-soon" };
  if (diffMins < 60)  return { text: `Due in ${diffMins} min${diffMins !== 1 ? "s" : ""}`, state: "due-soon" };
  if (diffHrs  < 24)  return { text: `Due in ${diffHrs} hour${diffHrs !== 1 ? "s" : ""}`,  state: "due-soon" };
  if (diffDays === 1) return { text: "Due tomorrow",       state: "future"   };
  if (diffDays <= 7)  return { text: `Due in ${diffDays} days`,              state: "future"   };
                      return { text: `Due in ${diffDays} days`,              state: "future"   };
}

function updateTimeRemaining() {
  if (!timeRemaining) return;

  // If task is done, show a completed message
  if (card.classList.contains("is-complete")) {
    timeRemaining.textContent = "Completed ✓";
    timeRemaining.className   = "time-remaining done-time";
    return;
  }

  const { text, state } = getTimeRemaining(DUE_DATE);
  timeRemaining.textContent = text;

  // Reset classes then apply correct variant
  timeRemaining.className = "time-remaining";
  if (state === "overdue")   timeRemaining.classList.add("overdue");
  if (state === "due-soon")  timeRemaining.classList.add("due-soon");
}

/* ── CHECKBOX TOGGLE ────────────────────────────────────────── */
function syncCardCompletionState() {
  const isDone = checkbox.checked;
  card.classList.toggle("is-complete", isDone);

  // Update status badge text and class
  const dotEl = statusBadge.querySelector(".status-dot");

  if (isDone) {
    statusBadge.textContent       = "";
    statusBadge.appendChild(dotEl || document.createElement("span"));
    statusBadge.querySelector(".status-dot").className = "status-dot";
    statusBadge.prepend(statusBadge.querySelector(".status-dot"));
    // Rebuild text node
    statusBadge.innerHTML =
      '<span class="status-dot" aria-hidden="true"></span> Done';
    statusBadge.className = "status-badge status--done";
    statusBadge.setAttribute("aria-label", "Status: Done");
  } else {
    statusBadge.innerHTML =
      '<span class="status-dot" aria-hidden="true"></span> In Progress';
    statusBadge.className = "status-badge status--in-progress";
    statusBadge.setAttribute("aria-label", "Status: In Progress");
  }

  // Animate badge
  statusBadge.style.animation = "none";
  // eslint-disable-next-line no-unused-expressions
  statusBadge.offsetHeight; // reflow
  statusBadge.style.animation = "statusPop 0.3s ease";

  // Refresh time remaining display
  updateTimeRemaining();
}

checkbox.addEventListener("change", syncCardCompletionState);

/* Keyboard: Space / Enter on the visible label also works natively
   since it's a real <input type="checkbox"> with associated <label>. */

/* ── EDIT BUTTON ────────────────────────────────────────────── */
editBtn.addEventListener("click", () => {
  console.log("✏️  edit clicked — task:", titleEl.textContent.trim());

  // Visual feedback flash
  editBtn.style.boxShadow = "0 0 0 3px rgba(129,140,248,0.45)";
  setTimeout(() => (editBtn.style.boxShadow = ""), 400);
});

/* ── DELETE BUTTON ──────────────────────────────────────────── */
deleteBtn.addEventListener("click", () => {
  const confirmed = window.confirm(
    `Delete task "${titleEl.textContent.trim()}"?\nThis action cannot be undone.`
  );
  if (confirmed) {
    // Animate card out
    card.style.transition = "opacity 0.35s ease, transform 0.35s ease";
    card.style.opacity    = "0";
    card.style.transform  = "scale(0.95) translateY(10px)";
    setTimeout(() => {
      card.style.display = "none";
    }, 360);
  }
});

/* ── INIT ───────────────────────────────────────────────────── */
updateTimeRemaining();

// Refresh every 60 seconds
setInterval(updateTimeRemaining, 60_000);
