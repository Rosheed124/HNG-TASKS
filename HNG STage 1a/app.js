/**
 * HNG Frontend Cohort — Stage 1a
 * Todo Card — Interactive & Stateful Logic
 *
 * Features:
 *  - Edit mode with save / cancel and focus management
 *  - Status dropdown (Pending / In Progress / Done) synced with checkbox
 *  - Priority indicator updates dynamically
 *  - Expand / collapse description with keyboard support
 *  - Overdue indicator + granular time remaining (updates every 30s)
 *  - "Done" freezes time display as "Completed"
 */

/* ── STATE ──────────────────────────────────────────────────── */
let state = {
  title:       'Redesign the Landing Page',
  description: 'Update the hero section with the new brand palette, revamp the feature grid, and ensure full WCAG AA accessibility compliance across all interactive elements. Coordinate with the design team to finalize typography choices and spacing system. Run Lighthouse audits on every breakpoint and address any regressions before the sprint demo on Friday.',
  priority:    'high',
  status:      'in-progress',
  dueDate:     new Date('2025-04-10T18:00:00Z'),
  expanded:    false,
};

// Snapshot used by "Cancel"
let savedState = { ...state };

/* ── CONSTANTS ──────────────────────────────────────────────── */
const COLLAPSE_CHAR_LIMIT = 160; // chars before we add expand toggle

/* ── DOM REFS ───────────────────────────────────────────────── */
const card             = document.querySelector('[data-testid="test-todo-card"]');
const checkbox         = document.querySelector('[data-testid="test-todo-complete-toggle"]');
const titleEl          = document.querySelector('[data-testid="test-todo-title"]');
const statusBadge      = document.querySelector('[data-testid="test-todo-status"]');
const priorityBadge    = document.querySelector('[data-testid="test-todo-priority"]');
const priorityIndicator= document.querySelector('[data-testid="test-todo-priority-indicator"]');
const descriptionEl    = document.querySelector('[data-testid="test-todo-description"]');
const timeRemainingEl  = document.getElementById('time-remaining-text');
const overdueIndicator = document.querySelector('[data-testid="test-todo-overdue-indicator"]');
const statusControl    = document.querySelector('[data-testid="test-todo-status-control"]');
const expandToggle     = document.querySelector('[data-testid="test-todo-expand-toggle"]');
const collapsibleEl    = document.querySelector('[data-testid="test-todo-collapsible-section"]');
const editBtn          = document.getElementById('edit-btn');
const deleteBtn        = document.querySelector('[data-testid="test-todo-delete-button"]');

// Edit form elements
const editForm         = document.querySelector('[data-testid="test-todo-edit-form"]');
const viewMode         = document.querySelector('.view-mode');
const editTitleInput   = document.querySelector('[data-testid="test-todo-edit-title-input"]');
const editDescInput    = document.querySelector('[data-testid="test-todo-edit-description-input"]');
const editPrioritySelect = document.querySelector('[data-testid="test-todo-edit-priority-select"]');
const editDueDateInput = document.querySelector('[data-testid="test-todo-edit-due-date-input"]');
const saveBtn          = document.querySelector('[data-testid="test-todo-save-button"]');
const cancelBtn        = document.querySelector('[data-testid="test-todo-cancel-button"]');

/* ── UTILITIES ──────────────────────────────────────────────── */
function formatDateForInput(date) {
  return date.toISOString().split('T')[0];
}

function parseDateInput(value) {
  // Parse as local midnight to avoid timezone shift
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 18, 0, 0);
}

/* ── TIME REMAINING ─────────────────────────────────────────── */
function getTimeInfo(due) {
  const now     = Date.now();
  const diffMs  = due.getTime() - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(Math.abs(diffSec) / 60);
  const diffHr  = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (diffSec <= 0) {
    // Overdue
    if (diffMin < 1)  return { text: 'Due now!',                               overdue: true };
    if (diffMin < 60) return { text: `Overdue by ${diffMin} min${diffMin !== 1 ? 's' : ''}`,  overdue: true };
    if (diffHr < 24)  return { text: `Overdue by ${diffHr} hour${diffHr !== 1 ? 's' : ''}`,   overdue: true };
                      return { text: `Overdue by ${diffDay} day${diffDay !== 1 ? 's' : ''}`,   overdue: true };
  }

  // Future
  const futureSec = Math.round(diffMs / 1000);
  const futureMin = Math.round(futureSec / 60);
  const futureHr  = Math.round(futureMin / 60);
  const futureDay = Math.round(futureHr / 24);

  if (futureMin < 5)  return { text: 'Due now!',                                           overdue: false };
  if (futureMin < 60) return { text: `Due in ${futureMin} min${futureMin !== 1 ? 's' : ''}`, overdue: false };
  if (futureHr < 24)  return { text: `Due in ${futureHr} hour${futureHr !== 1 ? 's' : ''}`,  overdue: false };
  if (futureDay === 1) return { text: 'Due tomorrow',                                       overdue: false };
                       return { text: `Due in ${futureDay} days`,                           overdue: false };
}

function updateTimeDisplay() {
  if (!timeRemainingEl) return;

  const isDone = state.status === 'done';
  if (isDone) {
    timeRemainingEl.textContent = 'Completed';
    timeRemainingEl.className   = 'time-remaining done-time';
    overdueIndicator.hidden     = true;
    return;
  }

  const { text, overdue } = getTimeInfo(state.dueDate);
  timeRemainingEl.textContent = text;
  timeRemainingEl.className   = 'time-remaining' + (overdue ? ' overdue' : '');

  // Overdue indicator
  overdueIndicator.hidden = !overdue;
}

/* ── PRIORITY INDICATOR ─────────────────────────────────────── */
const PRIORITY_CONFIG = {
  high:   { label: 'High',   cls: 'priority--high',   badgeText: 'High',   icon: '★' },
  medium: { label: 'Medium', cls: 'priority--medium', badgeText: 'Medium', icon: '◆' },
  low:    { label: 'Low',    cls: 'priority--low',    badgeText: 'Low',    icon: '▼' },
};

function applyPriority(priority) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;

  // Card-level data attr (drives CSS left-border via attr selector)
  card.dataset.priority = priority;

  // Priority badge
  priorityBadge.className = `priority-badge ${cfg.cls}`;
  priorityBadge.setAttribute('aria-label', `Priority: ${cfg.label}`);
  priorityBadge.innerHTML = `
    <svg class="badge-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M8 2L9.5 6H14L10.5 8.5L12 12.5L8 10L4 12.5L5.5 8.5L2 6H6.5L8 2Z" fill="currentColor"/>
    </svg>
    ${cfg.label}
  `;
}

/* ── STATUS SYNC ────────────────────────────────────────────── */
const STATUS_CONFIG = {
  'pending':     { label: 'Pending',     cls: 'status--pending' },
  'in-progress': { label: 'In Progress', cls: 'status--in-progress' },
  'done':        { label: 'Done',        cls: 'status--done' },
};

function applyStatus(status) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];

  // Update state
  state.status = status;
  card.dataset.status = status;

  // Status badge
  statusBadge.className = `status-badge ${cfg.cls}`;
  statusBadge.setAttribute('aria-label', `Status: ${cfg.label}`);
  statusBadge.innerHTML = `<span class="status-dot" aria-hidden="true"></span> ${cfg.label}`;

  // Status control dropdown
  statusControl.value = status;

  // Checkbox — synced with done
  const isDone = status === 'done';
  checkbox.checked = isDone;
  card.classList.toggle('is-complete', isDone);

  // Animate badge
  statusBadge.style.animation = 'none';
  // eslint-disable-next-line no-unused-expressions
  statusBadge.offsetHeight;
  statusBadge.style.animation = 'statusPop 0.3s ease';

  updateTimeDisplay();
}

/* ── EXPAND / COLLAPSE ──────────────────────────────────────── */
function initExpandCollapse() {
  const isTooLong = state.description.length > COLLAPSE_CHAR_LIMIT;

  if (!isTooLong) {
    expandToggle.hidden = true;
    collapsibleEl.classList.remove('is-collapsed');
    expandToggle.setAttribute('aria-expanded', 'true');
    return;
  }

  expandToggle.hidden = false;

  if (!state.expanded) {
    collapsibleEl.classList.add('is-collapsed');
    expandToggle.setAttribute('aria-expanded', 'false');
    expandToggle.querySelector('.expand-toggle-text').textContent = 'Show more';
    expandToggle.setAttribute('aria-label', 'Show more description');
    expandToggle.querySelector('.expand-icon').style.transform = '';
  } else {
    collapsibleEl.classList.remove('is-collapsed');
    expandToggle.setAttribute('aria-expanded', 'true');
    expandToggle.querySelector('.expand-toggle-text').textContent = 'Show less';
    expandToggle.setAttribute('aria-label', 'Show less description');
    expandToggle.querySelector('.expand-icon').style.transform = 'rotate(180deg)';
  }
}

expandToggle.addEventListener('click', () => {
  state.expanded = !state.expanded;
  initExpandCollapse();
});

/* ── STATUS CONTROL DROPDOWN ────────────────────────────────── */
statusControl.addEventListener('change', () => {
  applyStatus(statusControl.value);
});

/* ── CHECKBOX TOGGLE ────────────────────────────────────────── */
checkbox.addEventListener('change', () => {
  if (checkbox.checked) {
    applyStatus('done');
  } else {
    // Reverting from done → pending
    applyStatus('pending');
  }
});

/* ── EDIT MODE ──────────────────────────────────────────────── */
function openEditMode() {
  // Snapshot current state for cancel
  savedState = { ...state };

  // Populate form
  editTitleInput.value          = state.title;
  editDescInput.value           = state.description;
  editPrioritySelect.value      = state.priority;
  editDueDateInput.value        = formatDateForInput(state.dueDate);

  // Toggle visibility
  viewMode.hidden  = true;
  editForm.hidden  = false;

  // Focus first field
  editTitleInput.focus();
}

function closeEditMode(restoreState) {
  if (restoreState) {
    state = { ...savedState };
    renderAll();
  }

  viewMode.hidden = false;
  editForm.hidden = true;

  // Return focus to Edit button
  editBtn.focus();
}

function saveEdits(e) {
  e.preventDefault();

  const newTitle = editTitleInput.value.trim();
  if (!newTitle) {
    editTitleInput.focus();
    editTitleInput.classList.add('input-error');
    return;
  }
  editTitleInput.classList.remove('input-error');

  state.title       = newTitle;
  state.description = editDescInput.value.trim();
  state.priority    = editPrioritySelect.value;
  state.dueDate     = parseDateInput(editDueDateInput.value);

  renderAll();
  closeEditMode(false);
}

editBtn.addEventListener('click', openEditMode);
editForm.addEventListener('submit', saveEdits);
cancelBtn.addEventListener('click', () => closeEditMode(true));

/* ── DELETE BUTTON ──────────────────────────────────────────── */
deleteBtn.addEventListener('click', () => {
  const confirmed = window.confirm(
    `Delete task "${state.title}"?\nThis action cannot be undone.`
  );
  if (confirmed) {
    card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    card.style.opacity    = '0';
    card.style.transform  = 'scale(0.95) translateY(10px)';
    setTimeout(() => { card.style.display = 'none'; }, 360);
  }
});

/* ── RENDER ALL ─────────────────────────────────────────────── */
function renderAll() {
  // Title
  titleEl.textContent = state.title;
  card.setAttribute('aria-label', `Todo item: ${state.title}`);

  // Description
  descriptionEl.textContent = state.description;

  // Priority
  applyPriority(state.priority);
  state.priority = state.priority; // keep state

  // Status (without redundant re-render loop)
  const cfg = STATUS_CONFIG[state.status] || STATUS_CONFIG['pending'];
  statusBadge.className = `status-badge ${cfg.cls}`;
  statusBadge.setAttribute('aria-label', `Status: ${cfg.label}`);
  statusBadge.innerHTML = `<span class="status-dot" aria-hidden="true"></span> ${cfg.label}`;
  statusControl.value = state.status;
  card.dataset.status = state.status;
  checkbox.checked = state.status === 'done';
  card.classList.toggle('is-complete', state.status === 'done');

  // Expand/collapse reset when description changes
  state.expanded = false;
  initExpandCollapse();

  // Time
  updateTimeDisplay();
}

/* ── KEYBOARD — FOCUS TRAP IN EDIT FORM ─────────────────────── */
editForm.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;

  const focusable = Array.from(
    editForm.querySelectorAll('input, textarea, select, button:not([disabled])')
  ).filter(el => !el.hidden && el.tabIndex !== -1);

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// Escape closes edit mode
editForm.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeEditMode(true);
});

/* ── INIT ───────────────────────────────────────────────────── */
(function init() {
  applyPriority(state.priority);
  applyStatus(state.status);
  initExpandCollapse();
  updateTimeDisplay();

  // Refresh every 30 seconds
  setInterval(updateTimeDisplay, 30_000);
})();
