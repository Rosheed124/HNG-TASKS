# Testable Profile Card (HNG Stage 1b)

A robust, testable, accessibility-first Profile Card built specifically for Stage 1b of the HNG Frontend Cohort.

## Overview
This project meets all rigorous QA and semantic requirements by strictly implementing targeted `data-testid` attributes on isolated DOM nodes. The UI features a dynamic Javascript clock overriding real-time Epoch milliseconds natively.

## Features
- **Semantic Structure**: Fully leverages HTML5 structures (`<article>`, `<figure>`, `<nav>`, `<section>`).
- **Data Attributes Bound**: Built ready for E2E automated test suites using exact `data-testid` bindings seamlessly attached to interactive layers.
- **Dynamic Clock Synchronization**: Pure Vanilla Javascript accurately tracking `Date.now()` with high precision updates utilizing Web API `setInterval` functions every 100 milliseconds without dropping rendered frames.
- **Responsive Flex/Grid Mechanics**: Collapses cleanly to an optimized vertical stack on mobile (`<768px`) contexts while preserving sharp border box shadows.

## Running Locally

Because this project uses vanilla HTML, CSS, and JS (No build steps required), you can serve it via a simple HTTP server or directly in your browser.

1. **Clone the repo**
   ```bash
   git clone https://github.com/Rosheed124/HNG-TASKS.git
   ```
2. Navigate into the stage 1b folder
   ```bash
   cd "HNG Stage 1b"
   ```
3. Run using a standard live-server (e.g. running NodeJS `npx serve` or VS Code Live Server addon)
   ```bash
   npx serve .
   ```
4. Load `http://localhost:3000` locally.

## Accessibility (WCAG Pass)
- Enforces explicitly linked labels utilizing pure semantic `<header>`, explicit `<nav>` boundaries and structural `aria-*` tags.
- Tab interactions force highly visible outline boxes meeting WCAG AA Contrast Ratios.
- Fast-updating structural time metrics rely on `.tabular-nums` OpenType variables for reduced visual twitching.
