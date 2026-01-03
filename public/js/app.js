document.addEventListener("DOMContentLoaded", async () => {
    const trailGrid = document.getElementById("trail-grid");
    console.log("App.js loaded. Container found:", !!trailGrid);

    async function loadTrails() {
        try {
            console.log("Fetching trails...");
            const response = await fetch("/api/trails");
            const rawData = await response.json();

            // 1. The Cleanup Station (Fixing BOM and whitespace)
            const trails = rawData.map(trail => {
                let cleanTrail = {};
                for (let key in trail) {
                    const cleanKey = key.replace(/^\uFEFF/, '').trim();
                    cleanTrail[cleanKey] = typeof trail[key] === 'string' ? trail[key].trim() : trail[key];
                }
                return cleanTrail;
            });

            console.log("Data cleaned:", trails.length, "rows");

            if (!trails || trails.length === 0) {
                trailGrid.innerHTML = "<p>No trails found. Run migrate.js.</p>";
                return;
            }

            // 2. Render the Grid
            renderTrailCards(trails);
            
            // 3. Start Countdowns
            startCountdowns(trails);

        } catch (error) {
            console.error("Frontend Error:", error);
            if (trailGrid) trailGrid.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    }

    function renderTrailCards(trails) {
        trailGrid.innerHTML = trails.map((trail) => {
            const title = trail.attraction_1 || "Unnamed Trail";
            const time = trail.travel_time_from_shinjuku || "??";
            const desc = trail.Editorial || "No description available.";
            const difficulty = trail.difficulty_level || "Unknown";
            const id = trail.id;

            return `
                <div class="card" data-difficulty="${difficulty}">
                    <img src="${trail.attraction_1_image_url}" alt="${title}">
                    <div class="card-content">
                        <span class="tag">${trail.prefecture || "Tokyo"}</span>
                        <h2>${title}</h2>
                        <p><strong>${time} mins</strong> from Shinjuku</p>
                        <p>${desc}</p>
                        <div class="countdown-timer">
                            <span class="timer-label">Return Window:</span>
                            <span class="time-left" id="timer-${id}">Calculating...</span>
                        </div>
                        <button class="view-btn" onclick='openModal(${JSON.stringify(trail)})'>Explore</button>
                    </div>
                </div>
            `;
        }).join("");
        console.log("Cards injected into HTML.");
    }

    // Initialize the app
    loadTrails();
});

// --- Logic outside the DOMContentLoaded for global access ---

function startCountdowns(trails) {
    const updateTimers = () => {
        const deadline = new Date();
        deadline.setHours(19, 0, 0); // 7 PM
        const now = new Date();
        const diff = deadline - now;

        trails.forEach(trail => {
            const timerElement = document.getElementById(`timer-${trail.id}`);
            if (!timerElement) return;

            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                timerElement.innerText = `⏳ ${hours}h ${minutes}m until safe return`;
            } else {
                timerElement.innerText = "⚠️ Check local schedule";
            }
        });
    };
    updateTimers();
    setInterval(updateTimers, 60000);
}

function openModal(trail) {
    const modal = document.getElementById('trailModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <img src="${trail.attraction_1_image_url || 'https://loremflickr.com/800/400/mountain'}" style="width:100%; border-radius:8px;">
        <h2 style="margin-top:20px;">${trail.attraction_1}</h2>
        <p class="difficulty">Difficulty: ${trail.difficulty_level}</p>
        <hr>
        <h3>The Hike</h3>
        <p>${trail.Editorial || "No description available yet."}</p>
        <h3>Photography Highlights</h3>
        <p>${trail.photography_highlights || "Bring your best lens!"}</p>
    `;
    modal.style.display = "block";
}

// Close modal logic
document.addEventListener('click', (e) => {
    const modal = document.getElementById('trailModal');
    if (e.target.classList.contains('close-button') || e.target === modal) {
        modal.style.display = "none";
    }
});

// Filtering Logic
window.filterTrails = (level) => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const cardDiff = card.getAttribute('data-difficulty').toLowerCase();
        card.style.display = (level === 'all' || cardDiff.includes(level.toLowerCase())) ? 'block' : 'none';
    });
};