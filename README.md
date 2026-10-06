# The Activity Method™ — Professional Edition
## Minimum Viable Product (MVP) Prototype

This directory contains the MVP HTML/CSS/JS web prototype and the underlying metadata dataset for The Activity Method.

### File Structure
- `index.html`: The core wizard UI framework and result screens.
- `styles.css`: The premium styling reflecting the brand's professional positioning. No frameworks were used to keep it lightweight.
- `app.js`: The application logic that runs the wizard locally, implements filtering, and dynamically renders matches without a backend.
- `activities.json`: The meticulously crafted 35-activity dataset serving as our unified source of truth.

### Data Structure (`activities.json`)
The dataset is structured as an array of JSON objects. Each object follows strict keys representing practical implementation variables rather than clinical rehab metrics:
- `activity_id`, `title`, `primary_category`: Core identifiers.
- `secondary_skills`, `best_for`: Arrays for extended search tags.
- `participation`: Array of options (Seated, Partner, etc.).
- `time` and `difficulty`: Classification strings.
- `materials`: Array of specific object requirements.
- `setup`, `instructions`: String and Array (respectively) for execution mechanics.
- `make_it_easier`, `make_it_harder`, `adaptations`: Options for dynamic grading without compromising safety.
- `safety_considerations`: Specific functional constraints limiting risk.
- `professional_note`, `caregiver_note`: Usage guidance explicitly avoiding medical/diagnostic claims.
- `visual_type`: Determines the style of future illustrations to be added.

### Filtering Logic
The matching algorithm in `app.js` uses a weighted scoring mechanism rather than a rigid boolean filter. This guarantees the user is always presented with exactly 3 practical activities, avoiding empty states. 

**Scoring Weights:**
1. **Goal (+10):** A direct match to the `primary_category` yields the highest score, ensuring the most foundational requirement is met.
2. **Participation (+5):** If the user's selected limitation exists in the activity's `participation` array (case-insensitive fuzzy match), it adds medium weight.
3. **Time (+5):** Exact matches to the selected time string grant another medium weight.
4. **Materials (+3):** The logic uses simple semantic grouping. If the user chooses "No materials" and the activity lists "No materials," it adds weight. If they select "Any," all items gain weight.

**Output:**
The objects are sorted descending by their accumulated `score`. The `Array.slice(0, 3)` method plucks exactly the highest-scoring top 3 activities for the display grid, which can then be expanded into the detailed activity view.
# the_activity_method
