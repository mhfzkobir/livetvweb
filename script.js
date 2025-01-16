// script.js
const m3uUrl = "https://denverisalive.vercel.app/Playlist/TATA_TV6.m3u"; // Replace with your m3u link
const channelsGrid = document.getElementById("channels-grid");
const searchBar = document.getElementById("search-bar");
const categorySelect = document.getElementById("category-select");
const playerModal = document.getElementById("player-modal");
const closeModal = document.getElementById("close-modal");
const darkModeToggle = document.getElementById("dark-mode");

let channels = [];
let categories = [];

// Fetch and parse m3u playlist
async function fetchPlaylist() {
    try {
        const response = await fetch(m3uUrl);
        const playlist = await response.text();
        channels = parseM3U(playlist);
        extractCategories();
        displayChannels(channels);
    } catch (error) {
        console.error("Error fetching playlist:", error);
    }
}

// Parse m3u text into an array of channel objects
function parseM3U(playlist) {
    const lines = playlist.split("\n");
    const channelList = [];
    let channelName = "";
    let channelLogo = "";
    let category = "Uncategorized";
    lines.forEach((line) => {
        if (line.startsWith("#EXTINF")) {
            const nameMatch = line.match(/,([^,]+)$/);
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            const groupMatch = line.match(/group-title="([^"]+)"/);
            channelName = nameMatch ? nameMatch[1] : "Unknown Channel";
            channelLogo = logoMatch ? logoMatch[1] : "placeholder.png";
            category = groupMatch ? groupMatch[1] : "Uncategorized";
        } else if (line.trim() && !line.startsWith("#")) {
            channelList.push({
                name: channelName,
                logo: channelLogo,
                category,
                url: line.trim(),
            });
        }
    });
    return channelList;
}

// Extract unique categories from channels
function extractCategories() {
    categories = ["All", ...new Set(channels.map((ch) => ch.category))];
    categorySelect.innerHTML = categories
        .map((cat) => `<option value="${cat}">${cat}</option>`)
        .join("");
}

// Display channels in a grid
function displayChannels(channels) {
    channelsGrid.innerHTML = channels
        .map(
            (channel) => `
        <div class="card" data-url="${channel.url}" data-category="${channel.category}">
            <img src="${channel.logo}" alt="${channel.name}">
            <div class="card-title">${channel.name}</div>
        </div>
        `
        )
        .join("");
}

// Initialize THEOplayer and show modal
function playChannel(url) {
    const playerElement = document.getElementById("player");
    const player = new THEOplayer.Player(playerElement, {
        libraryLocation: "https://cdn.myth.theoplayer.com/theoplayer/v5/latest/",
    });
    player.source = {
        sources: [{ src: url, type: "application/x-mpegurl" }],
    };
    playerModal.style.display = "flex";
}

// Event listeners
channelsGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".card");
    if (card) {
        const channelUrl = card.getAttribute("data-url");
        playChannel(channelUrl);
    }
});

closeModal.addEventListener("click", () => {
    playerModal.style.display = "none";
});

searchBar.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredChannels = channels.filter((channel) =>
        channel.name.toLowerCase().includes(searchTerm)
    );
    displayChannels(filteredChannels);
});

categorySelect.addEventListener("change", (event) => {
    const selectedCategory = event.target.value;
    const filteredChannels =
        selectedCategory === "All"
            ? channels
            : channels.filter((channel) => channel.category === selectedCategory);
    displayChannels(filteredChannels);
});

darkModeToggle.addEventListener("change", (event) => {
    document.body.classList.toggle("dark-mode", event.target.checked);
});

// Load playlist on page load
fetchPlaylist();
