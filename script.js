// script.js
const m3uUrl = "https://freelivtva.vercel.app/playlist%20(8).m3u"; // Replace with your m3u link
const channelsGrid = document.getElementById("channels-grid");
const searchBar = document.getElementById("search-bar");
const playerModal = document.getElementById("player-modal");
const closeModal = document.getElementById("close-modal");

let channels = [];

// Fetch and parse m3u playlist
async function fetchPlaylist() {
    try {
        const response = await fetch(m3uUrl);
        const playlist = await response.text();
        channels = parseM3U(playlist);
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
    lines.forEach((line) => {
        if (line.startsWith("#EXTINF")) {
            const nameMatch = line.match(/,([^,]+)$/);
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            channelName = nameMatch ? nameMatch[1] : "Unknown Channel";
            channelLogo = logoMatch ? logoMatch[1] : "placeholder.png";
        } else if (line.trim() && !line.startsWith("#")) {
            channelList.push({
                name: channelName,
                logo: channelLogo,
                url: line.trim(),
            });
        }
    });
    return channelList;
}

// Display channels in a grid
function displayChannels(channels) {
    channelsGrid.innerHTML = channels
        .map(
            (channel) => `
        <div class="card" data-url="${channel.url}">
            <img src="${channel.logo}" alt="${channel.name}">
            <div class="card-title">${channel.name}</div>
        </div>
        `
        )
        .join("");
}

// Initialize Flowplayer and show modal
function playChannel(url) {
    const playerElement = document.getElementById("player");
    flowplayer(playerElement, {
        clip: {
            sources: [{ type: "application/x-mpegurl", src: url }],
        },
    });
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

// Load playlist on page load
fetchPlaylist();
