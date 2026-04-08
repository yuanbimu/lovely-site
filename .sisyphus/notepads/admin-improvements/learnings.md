# Admin Improvements - Learnings

## Task 7: Fix Build Error - dynamics.json missing

### What we learned
- dynamics.astro was importing a non-existent JSON file `../data/dynamics.json`
- Build failed with "Could not resolve" error
- Fix: Convert to client-side React component fetching from `/api/dynamics` endpoint
- Created new `src/components/DynamicsList.tsx` component

### Reference files
- `src/pages/dynamics.astro` - page that had the issue
- `src/components/DynamicsList.tsx` - new React component
- `functions/api/[[route]].ts` - has `/api/dynamics` endpoint

### Key changes
1. Removed static JSON import from dynamics.astro
2. Added DynamicsList React component with client-side fetching
3. Build now passes

### Created
- 2026-04-08

---

## Task 1: Admin Layout Fix

### What we learned
- Admin CSS needs centering with max-width and margin: 0 auto
- Need 3-column grid for cards
- Current `.admin-main` doesn't have centering
- `.stats-grid` needs explicit 3-column instead of auto-fit

### Reference files
- `src/components/AdminDashboard.css` - main admin styles
- `src/layouts/AdminLayout.astro` - layout wrapper

### Key changes needed
1. Add `max-width: 1200px; margin: 0 auto;` to `.admin-main`
2. Change stats grid from `repeat(auto-fit, minmax(200px, 1fr))` to explicit 3 columns
3. Ensure tables/forms are also centered

### Created
- 2026-04-08
