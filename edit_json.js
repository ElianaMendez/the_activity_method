const fs = require('fs');
const data = JSON.parse(fs.readFileSync('activities.json', 'utf8'));

// 1. Heel-to-Toe Walking Lines
const walk = data.find(a => a.activity_id === 'mov_02');
if (walk) {
    walk.make_it_harder = 'Walk a slightly longer distance or practice pacing by stepping cleanly to a metronome beat.';
}

// 2. Household Target Toss
const toss = data.find(a => a.activity_id === 'bal_05');
if (toss) {
    toss.instructions[3] = 'Keep extra objects within easy reach, or have a partner retrieve them to avoid unnecessary bending.';
}

// 3. Visual Schedule Organizer
const org = data.find(a => a.activity_id === 'adl_03');
if (org) {
    org.title = 'Daily Routine Organizer';
    org.secondary_skills = ['Task Management', 'Organization'];
    org.materials = ['Activity cards', 'Time-of-day cards', 'Colored tokens or wooden blocks', 'A clear table space'];
    org.setup = 'Provide a set of simple visual activity cards and time-of-day slots (morning, afternoon, evening). Ensure good lighting.';
    org.instructions = [
        'Review the available activity cards and time slots.',
        'Select the activities intended for the morning and place them under the morning card.',
        'Use colored tokens or wooden blocks to mark activities that are high priority or require extra time.',
        'Complete the entire day\'s mock layout, then double-check the logic.'
    ];
    org.make_it_easier = 'Sort only one or two events into a simple morning/afternoon split rather than a full day.';
    org.make_it_harder = 'Introduce a brief distraction (e.g., conversation) and have them resume organizing accurately without losing place.';
    org.adaptations = 'Use large wooden blocks or brightly colored high-contrast cards if visual tracking is difficult.';
    org.professional_note = 'Practices attention to detail and logical planning using a universally recognizable routine format.';
    org.caregiver_note = 'Remind them to take it one time slot at a time and encourage discussion about their actual routine.';
    org.safety_considerations = 'Ensure any tokens used are large enough to be easily handled. Keep the table clear of clutter.';
}

// 4. Tactile Fabric Board construction -> Tactile Fabric Board Construction
const board = data.find(a => a.activity_id === 'cre_05');
if (board) {
    board.title = 'Tactile Fabric Board Construction';
}

fs.writeFileSync('activities.json', JSON.stringify(data, null, 2));
console.log('Edits applied.');
