document.addEventListener("DOMContentLoaded", async () => {
  const trailGrid = document.getElementById("trail-grid");
  console.log("App.js loaded. Container found:", !!trailGrid);

  async function loadTrails() {
    try {
      const response = await fetch("/api/trails");
      const trails = await response.json();

      console.log("Data received from server:", trails.length, "rows");

      if (!trails || trails.length === 0) {
        trailGrid.innerHTML =
          "<p>Connected to database, but no trails found. Run migrate.js again.</p>";
        return;
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

function startCountdowns(trails) {
    const updateAll = () => {
        trails.forEach(trail => {
            const timerElement = document.getElementById(`timer-${trail.id}`);
            if (!timerElement) return;

            // Logic: Assume a "Last Safe Departure" at 7 PM (19:00)
            const deadline = new Date();
            deadline.setHours(19, 0, 0);

            const now = new Date();
            const diff = deadline - now;

            if (diff > 0) {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                timerElement.innerText = `${hours}h ${minutes}m remaining`;
            } else {
                timerElement.innerText = "Check local schedule";
            }
        });
    };

    updateAll(); // Run once immediately so it doesn't wait 60 seconds
    setInterval(updateAll, 60000); // Then update every minute
}

