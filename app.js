document.addEventListener('DOMContentLoaded', async () => {

    let activitiesData = [];
    let visualMap = {};
    const state = {
        step: 1,
        filters: {
            goal: null,
            participation: null,
            time: null,
            materials: null
        }
    };

    // DOM Elements
    const wizardSection = document.getElementById('wizard-section');
    const resultsSection = document.getElementById('results-section');
    const detailSection = document.getElementById('detail-section');

    const steps = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3'),
        document.getElementById('step-4')
    ];

    const indicators = document.querySelectorAll('.step-indicator');
    const btnBack = document.getElementById('btn-back');
    const btnNext = document.getElementById('btn-next');
    const btnResults = document.getElementById('btn-results');

    // Initialization
    try {
        const res = await fetch('activities.json');
        activitiesData = await res.json();

        const mapRes = await fetch(`assets/images/activity_visual_map.json?v=${Date.now()}`);
        visualMap = await mapRes.json();

        populateOptions();
        updateUI();
    } catch (err) {
        console.error('Failed to load data:', err);
        document.getElementById('options-goal').innerHTML = '<p>Error loading dataset.</p>';
    }

    // Generate unique filter options dynamically from dataset
    function populateOptions() {
        const goals = [...new Set(activitiesData.map(a => a.primary_category))];
        const participationSet = new Set();
        activitiesData.forEach(a => a.participation.forEach(p => participationSet.add(p)));
        const parts = [...participationSet];
        const times = [...new Set(activitiesData.map(a => a.time))];

        // For materials, to avoid too many specific options, we provide broad categories based on the dataset, 
        // plus an option to skip/any.
        const mats = ['No materials', 'Stable chair', 'Paper / Writing', 'Household objects', 'Any'];

        renderGrid('options-goal', goals, 'goal');
        renderGrid('options-participation', parts, 'participation');
        renderGrid('options-time', times, 'time');
        renderGrid('options-materials', mats, 'materials');
    }

    function renderGrid(containerId, items, filterKey) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'option-card';
            div.textContent = item;
            div.addEventListener('click', () => {
                // Deselect siblings
                Array.from(container.children).forEach(child => child.classList.remove('selected'));
                // Select this
                div.classList.add('selected');
                state.filters[filterKey] = item;
                updateUI();
            });
            container.appendChild(div);
        });
    }

    function updateUI() {
        // Manage step visibility
        steps.forEach((s, idx) => {
            if (idx + 1 === state.step) {
                s.classList.remove('hidden');
            } else {
                s.classList.add('hidden');
            }
        });

        // Manage indicators
        indicators.forEach(ind => {
            const st = parseInt(ind.dataset.step);
            if (st <= state.step) {
                ind.classList.add('active');
            } else {
                ind.classList.remove('active');
            }
        });

        // Manage buttons
        btnBack.classList.toggle('hidden', state.step === 1);

        if (state.step < 4) {
            btnNext.classList.remove('hidden');
            btnResults.classList.add('hidden');
            // Enable next if current step has a selection
            const currentKeys = ['goal', 'participation', 'time'];
            const hasSelection = state.filters[currentKeys[state.step - 1]] !== null;
            btnNext.disabled = !hasSelection;
            btnNext.classList.toggle('disabled', !hasSelection);
        } else {
            btnNext.classList.add('hidden');
            btnResults.classList.remove('hidden');
            const hasSelection = state.filters.materials !== null;
            btnResults.disabled = !hasSelection;
            btnResults.classList.toggle('disabled', !hasSelection);
        }
    }

    btnNext.addEventListener('click', () => {
        if (state.step < 4) {
            state.step++;
            updateUI();
        }
    });

    btnBack.addEventListener('click', () => {
        if (state.step > 1) {
            state.step--;
            updateUI();
        }
    });

    btnResults.addEventListener('click', () => {
        findMatches();
        wizardSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
    });

    document.getElementById('btn-modify-filters').addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        wizardSection.classList.remove('hidden');
    });

    document.getElementById('btn-back-results').addEventListener('click', () => {
        detailSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
    });

    function findMatches() {
        // Scoring Algorithm
        const scored = activitiesData.map(activity => {
            let score = 0;

            if (activity.primary_category === state.filters.goal) score += 10;

            const partsArr = activity.participation.map(p => p.toLowerCase());
            if (partsArr.includes(state.filters.participation.toLowerCase())) score += 5;

            if (activity.time === state.filters.time) score += 5;

            // Material fuzzy matching
            const userMats = state.filters.materials.toLowerCase();
            const needsNoMaterials = activity.materials.some(m => m.toLowerCase().includes('no materials'));
            if (userMats === 'any' ||
                (userMats === 'no materials' && needsNoMaterials) ||
                (userMats === 'stable chair' && activity.materials.some(m => m.toLowerCase().includes('chair'))) ||
                (userMats === 'paper / writing' && activity.materials.some(m => m.toLowerCase().includes('paper') || m.toLowerCase().includes('pen'))) ||
                (userMats === 'household objects' && !needsNoMaterials)) {
                score += 3;
            }

            return { activity, score };
        });

        // Sort descending by score, take top 3
        scored.sort((a, b) => b.score - a.score);
        const topMatches = scored.slice(0, 3); // Return scored object for match quality parsing

        renderResults(topMatches);
    }

    function renderResults(matches) {
        const grid = document.getElementById('results-grid');
        grid.innerHTML = '';

        matches.forEach(mObj => {
            const m = mObj.activity;
            const score = mObj.score;
            const isStrongMatch = (score === 23);

            const matchLabel = isStrongMatch
                ? '<div class="match-quality strong-match">Strong Match</div>'
                : '<div class="match-quality good-alt">Good Alternative</div>';

            const userPart = state.filters.participation || '';
            const displayPart = m.participation.some(p => p.toLowerCase() === userPart.toLowerCase())
                ? userPart
                : m.participation[0];

            const div = document.createElement('div');
            div.className = 'result-card';
            div.innerHTML = `
        <div class="result-info">
          ${matchLabel}
          <h3>${m.title}</h3>
          <div class="result-meta">
            <span class="meta-item"><strong>Category:</strong> ${m.primary_category}</span>
            <span class="meta-item"><strong>Time:</strong> ${m.time}</span>
            <span class="meta-item"><strong>Participation:</strong> ${displayPart}</span>
          </div>
        </div>
        <button class="btn btn-secondary view-btn" data-id="${m.activity_id}">View Activity</button>
      `;
            grid.appendChild(div);

            div.querySelector('.view-btn').addEventListener('click', () => {
                showActivityDetail(m);
            });
        });
    }

    function showActivityDetail(activity) {
        resultsSection.classList.add('hidden');
        detailSection.classList.remove('hidden');

        const content = document.getElementById('activity-detail-content');

        // Parse instructions if array
        const instrHTML = Array.isArray(activity.instructions)
            ? `<ul>${activity.instructions.map(i => `<li>${i}</li>`).join('')}</ul>`
            : `<p>${activity.instructions}</p>`;

        let visualContent = '<span class="visual-label">Activity Visual</span>';
        const mapEntry = visualMap[activity.activity_id];
        if (mapEntry && mapEntry.visual_status === 'APPROVED' && mapEntry.image_filename) {
            visualContent = `<img src="assets/images/${mapEntry.image_filename}?v=${Date.now()}" alt="${activity.title} instruction sequence" class="pilot-visual" />`;
        }

        content.innerHTML = `
      <div class="detail-category">${activity.primary_category}</div>
      
      <div class="detail-header-block-vertical">
        <div class="detail-title-area">
          <h2 class="detail-title">${activity.title}</h2>
        </div>
      </div>
      
      <div class="visual-area-full">
        ${visualContent}
      </div>
      
      <div class="detail-grid">
        <div class="detail-sidebar">
          <h4>Best For</h4>
          <ul>${activity.best_for.map(b => `<li>${b}</li>`).join('')}</ul>
          
          <h4>Time</h4>
          <p>${activity.time}</p>
          
          <h4>Materials</h4>
          <ul>${activity.materials.map(m => `<li>${m}</li>`).join('')}</ul>
          
          <h4>Participation</h4>
          <p>${activity.participation.join(', ')}</p>
          
          <h4>Difficulty</h4>
          <p>${activity.difficulty}</p>
        </div>
        
        <div class="detail-main">
          <h4>Setup</h4>
          <p>${activity.setup}</p>
          
          <h4>Instructions</h4>
          ${instrHTML}
          
          <h4>Adaptations</h4>
          <p><strong>Make it easier:</strong> ${activity.make_it_easier}</p>
          <p><strong>Make it harder:</strong> ${activity.make_it_harder}</p>
          <p><strong>Specific Adaptations:</strong> ${activity.adaptations}</p>
          
          <div class="alert-box">
            <h5>Safety Considerations</h5>
            <p>${activity.safety_considerations}</p>
          </div>
          
          <div class="alert-box note-box">
            <h5>Professional Note</h5>
            <p>${activity.professional_note}</p>
            <p style="margin-top:8px;"><em>${activity.caregiver_note}</em></p>
          </div>
        </div>
      </div>
    `;
    }

});
