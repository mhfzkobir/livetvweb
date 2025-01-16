// script.js
const m3uUrl = "https://example.com/playlist.m3u"; // Replace with your m3u link
const channelsGrid = document.getElementById("channels-grid");
const shakaPlayerContainer = document.getElementById("shaka-player");
const hlsPlayer = document.getElementById("hls-player");
const jwPlayerContainer = document.getElementById("jw-player");
const playerSelector = document.getElementById("player-selector");

let channels = [];

// Initialize Shaka Player
async function initShakaPlayer(url) {
    shakaPlayerContainer.classList.remove("hidden");
    const video = document.createElement("video");
    video.setAttribute("controls", "");
    shakaPlayerContainer.innerHTML = "";
    shakaPlayerContainer.appendChild(video);
    const player = new shaka.Player(video);
    try {
        await player.load(url);
    } catch (error) {
        console.error("Shaka Player failed to load:", error);
    }
}

// Initialize hls.js Player
function initHLSPlayer(url) {
    hlsPlayer.classList.remove("hidden");
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(hlsPlayer);
    } else {
        console.error("hls.js is not supported in this browser.");
    }
}

// Initialize JW Player
function initJWPlayer(url) {
    jwPlayerContainer.classList.remove("hidden");
    jwplayer("jw-player").setup({
        file: url,
        width: "100%",
        aspectratio: "16:9",
    });
}

// Detect format and play channel
function playChannel(url) {
    shakaPlayerContainer.classList.add("hidden");
    hlsPlayer.classList.add("hidden");
    jwPlayerContainer.classList.add("hidden");

    if (url.endsWith(".m3u8")) {
        initHLSPlayer(url);
    } else if (url.endsWith(".mpd")) {
        initShakaPlayer(url);
    } else {
        playerSelector.classList.remove("hidden");
        playerSelector.addEventListener("change", () => {
            playerSelector.classList.add("hidden");
            const selectedPlayer = playerSelector.value;
            if (selectedPlayer === "shaka") {
                initShakaPlayer(url);
            } else if (selectedPlayer === "hls") {
                initHLSPlayer(url);
            } else if (selectedPlayer === "jw") {
                initJWPlayer(url);
            }
        });
    }
}

// Fetch and parse m3u playlist
async function fetchPlaylist() {
    const response = await fetch(m3uUrl);
    const playlist = await response.text();
    channels = parseM3U(playlist);
    displayChannels(channels);
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

// Event listeners
channelsGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".card");
    if (card) {
        const channelUrl = card.getAttribute("data-url");
        playChannel(channelUrl);
    }
});

// Load playlist on page load
fetchPlaylist();
