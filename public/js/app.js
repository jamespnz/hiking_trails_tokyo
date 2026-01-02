document.addEventListener("DOMContentLoaded", async () => {
  const trailGrid = document.getElementById("trail-grid");
  console.log("App.js loaded. Container found:", !!trailGrid);

  async function loadTrails() {
    try {
        const response = await fetch("/api/trails");
        const rawData = await response.json(); // 1. Catch the "raw" messy data

        // 2. The Cleanup Station
        const trails = rawData.map(trail => {
            let cleanTrail = {};
            for (let key in trail) {
                // Remove BOM (\uFEFF) and trim whitespace from keys
                const cleanKey = key.replace(/^\uFEFF/, '').trim();
                // Trim whitespace from string values
                cleanTrail[cleanKey] = typeof trail[key] === 'string' ? trail[key].trim() : trail[key];
            }
            return cleanTrail;
        });

        console.log("Data cleaned and processed:", trails.length, "rows");

        if (!trails || trails.length === 0) {
            trailGrid.innerHTML =
                "<p>Connected to database, but no trails found. Run migrate.js again.</p>";
            return;
        }

        // 3. Now pass the CLEAN trails to your other functions
        displayTrails(trails);      // Renders the grid
        startCountdowns(trails);   // Starts the 7 PM timer
        setupFilters(trails);      // (If you have filtering)

    } catch (error) {
        console.error("Error loading trails:", error);
    }
}

      // Map the data to the HTML cards
      trailGrid.innerHTML = trails
        .map((trail) => {
          // We use || to provide 'fallback' text in case a column is empty
          const title = trail.attraction_1 || "Unnamed Trail";
          const time = trail.travel_time_from_shinjuku || "??";
          const desc = trail.Editorial || "No description available.";
          const difficulty = trail.difficulty_level || "Unknown";

          return `
                <div class="card" data-difficulty="${difficulty}">
                    <img src="https://loremflickr.com/600/400/japan,nature,hiking/all?lock=${trail.id}" 
     alt="${trail.attraction_1}">
                    <div class="card-content">
                        <span class="tag">${trail.prefecture || "Japan"}</span>
                        <h2>${title}</h2>
                        <p><strong>${time} mins</strong> from Shinjuku.</p>
                        <p>${desc}</p>
                        <div class="countdown-timer">
                            <span class="timer-label">Return Window:</span>
                            <span class="time-left" id="timer-${
                              trail.id
                            }">Calculating...</span>
                        </div>
                        <button class="view-btn">Explore</button>
                    </div>
                </div>
                `;
        })
        .join("");

      console.log("Cards injected into HTML.");
      startCountdowns(trails);
    } catch (err) {
      console.error("Frontend Error:", err);
      trailGrid.innerHTML = `<p>Error rendering cards: ${err.message}</p>`;
    }
  }

  loadTrails();

});

// Difficulty Matcher Logic
// This connects your HTML buttons to your trail cards
window.filterTrails = (level) => {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        // We get the difficulty from the 'data-difficulty' attribute we set in the loop
        const cardDifficulty = card.getAttribute('data-difficulty').toLowerCase();
        
        if (level === 'all') {
            card.style.display = 'block';
        } else if (cardDifficulty.includes(level.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    // Optional: Log it so you can see the machine working in the console
    console.log(`Filtering for: ${level}`);
    };

// 1. BUILD THE CARDS (Run this once after fetching data)
function displayTrails(trails) {
    const container = document.getElementById('trailsContainer');
    container.innerHTML = ''; 

    trails.forEach(trail => {
        const card = document.createElement('div');
        card.className = 'trail-card';

        card.innerHTML = `
            <img src="https://loremflickr.com/400/250/mountain,forest?lock=${trail.id}" alt="${trail.name}">
            <div class="card-content">
                <h3>${trail.name}</h3>
                <p>Difficulty: ${trail.difficulty}</p>
                <p class="timer" id="timer-${trail.id}">Calculating...</p> 
                <button class="explore-btn">Explore</button>
            </div>
        `;

        const btn = card.querySelector('.explore-btn');
        btn.addEventListener('click', () => openModal(trail));

        container.appendChild(card);
    });
}

// 2. UPDATE THE TIMERS (Run this every minute)
function startCountdowns(trails) {
    const updateTimers = () => {
        const deadline = new Date();
        deadline.setHours(19, 0, 0); // 7 PM
        const now = new Date();
        const diff = deadline - now;

        trails.forEach(trail => {
            // Find the specific timer element for THIS trail
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


// Function to open modal with trail details
function openModal(trail) {
    const modal = document.getElementById('trailModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <img src="${trail.image_url || 'https://loremflickr.com/800/400/mountain'}" alt="${trail.name}" style="width:100%; border-radius:8px;">
        <h2 style="margin-top:20px;">${trail.name}</h2>
        <p class="difficulty">Difficulty: ${trail.difficulty}</p>
        <hr>
        <h3>The Hike</h3>
        <p>${trail.editorial || "No description available yet."}</p>
        
        <h3>Photography Highlights</h3>
        <p>${trail.photography_highlights || "Bring your best lens for these views!"}</p>
        
        <h3>Landscape & History</h3>
        <p>${trail.landscape_history || "A path steeped in local culture."}</p>
    `;

    modal.style.display = "block";
}

// Inside openModal function
const photoText = trail.photography_highlights || "Standard forest views. Best during golden hour.";
const historyText = trail.landscape_history || "A traditional path used by local hikers for generations.";

// Close modal logic
document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('trailModal').style.display = "none";
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('trailModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

// Update your existing card-creation loop:
// Ensure the "Explore" button has: 
// button.onclick = () => openModal(trail);



