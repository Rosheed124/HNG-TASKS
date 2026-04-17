# Todo Card Component — Stage 1a

This project is part of the **Advanced Todo Card** challenge (Stage 1a) for the HNG Frontend Cohort. It extends a static Todo card from Stage 0 into a fully interactive, stateful component while adhering strictly to semantic HTML, accessibility standards, and responsive design guidelines.

## What changed from Stage 0
We transitioned from a static representation to an interactive application-like component. Key features added:
- **Editing Mode**: An edit button smoothly transitions the card into an edit form (capturing title, description, priority, and due date). Includes save and cancel functionality.
- **Status Controls**: A dedicated dropdown now allows toggling between "Pending", "In Progress", and "Done". This state is visually synchronized in real-time with a custom completion checkbox and a status badge.
- **Dynamic Priority Indicator**: The priority badge and the left-border accent bar now update dynamically based on Priority (Low, Medium, High).
- **Expand/Collapse**: Long descriptions text (>160 characters) defaults to a truncated view with a gradient fade. An expand/collapse ('Show more') toggle was added.
- **Time Management Enhancements**: The "time remaining" label dynamically updates every 30 seconds. If the deadline passes, an explicit "Overdue" pulse indicator is shown. Marking a task as "Done" gracefully replaces the time logic with a static "Completed" state.

## New design decisions
- **Glassmorphism & Gradients**: Integrated backdrop-filters and subtle radial gradient backgrounds to enforce a strictly premium, "SaaS-dashboard" aesthetic.
- **Visual State Syncing**: The `[data-priority]` and `[data-status]` attributes on the top-level article conditionally steer the UI via CSS attribute selectors, keeping the stylesheet lean.
- **Form UI**: The Edit Mode utilizes integrated input fields built seamlessly into the component flow rather than popping a destructive modal, maintaining context.

## Any known limitations
- **Ephemeral State**: State changes (edits, status updates) are retained purely in memory within `app.js` and will gracefully revert to their default initial values on browser refresh.
- **Scale**: The logic currently focuses on manipulating a single static Todo Item via IDs and `data-testid` query selectors, so scaling to an array of Cards would require wrapping the logic inside a Class or structural framework map.

## Accessibility notes
- **Labels & Inputs**: All inputs and interactive custom select boundaries are implicitly and explicitly labeled (`<label for="...">` and `.sr-only` visually hidden tags).
- **Focus Management**: Focus is manually trapped during Edit form interaction (Tab, Shift+Tab), and hitting `Escape` backs out gracefully. Cancelling or Saving properly restores focus to the triggering Edit button.
- **Aria Updates**: Live time-tracking changes use `aria-live="polite"`. Expandable areas enforce synchronous `aria-expanded` flag updates along with their corresponding `aria-controls`. Focus outlines have been strictly modified for AAA compliance high contrast visibility.

