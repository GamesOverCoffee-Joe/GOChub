// Global variable to store all consulting videos once fetched
let allConsultingVideos = [];
// Global variable to store all readings once fetched
let allReadings = [];

// Helper function to format time for consulting video links (MM:SS)
const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Helper function to find a reading for a given videoId
const findReadingForVideo = (videoId) => {
    // Early return if allReadings is not yet populated
    if (allReadings.length === 0) {
        console.warn("Attempted to find reading before allReadings was populated.");
        return null;
    }
    return allReadings.find(reading => reading.videoId === videoId);
};

// --- READING MODAL FUNCTIONS ---
const readingModal = document.getElementById('readingModal');
const closeModalButton = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const modalSourceLink = document.getElementById('modalSourceLink');

const openReadingModal = (reading) => {
    modalTitle.textContent = reading.title;
    modalContent.innerHTML = reading.content;
    // Set the source link directly to the YouTube video URL
    modalSourceLink.href = `https://www.youtube.com/watch?v=${reading.videoId}`;
    modalSourceLink.textContent = reading.linkText || 'View Source Video'; // Use linkText or default
    readingModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden'); // Prevent scrolling body
};

const closeModal = () => {
    readingModal.classList.add('hidden');
    // Ensure body scroll is re-enabled only if both modals are closed
    if (videoPlaybackModal.classList.contains('hidden')) {
        document.body.classList.remove('overflow-hidden');
    }
};

// --- VIDEO PLAYBACK MODAL FUNCTIONS ---
const videoPlaybackModal = document.getElementById('videoPlaybackModal');
const closeVideoModalButton = document.getElementById('closeVideoModal');
const videoIframe = document.getElementById('videoIframe');
// Corrected IDs to match HTML
const videoModalTitle = document.getElementById('videoModalTitle');
const videoModalChannel = document.getElementById('videoModalChannel');
const videoModalDescription = document.getElementById('videoModalDescription');
const videoModalYoutubeLink = document.getElementById('videoModalYoutubeLink'); // New element

const openVideoPlaybackModal = (videoId, title, channel, description = '', startTime = 0) => {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&start=${startTime}`;
    videoIframe.src = embedUrl;
    videoModalTitle.textContent = title;
    videoModalChannel.textContent = `Channel: ${channel}`;
    videoModalDescription.textContent = description; // Set description
    videoModalYoutubeLink.href = `https://www.youtube.com/watch?v=${videoId}`; // Set YouTube link
    videoPlaybackModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden'); // Prevent scrolling body
};

const closeVideoModal = () => {
    videoIframe.src = ''; // Stop video playback
    videoPlaybackModal.classList.add('hidden');
    // Ensure body scroll is re-enabled only if both modals are closed
    if (readingModal.classList.contains('hidden')) {
        document.body.classList.remove('overflow-hidden');
    }
};

// --- Highlighting Functions (these remain, but will primarily be used if navigation logic were re-introduced or through direct URL parameters) ---
const applyHighlight = (element, duration = 2000) => {
    if (!element) {
        console.warn("applyHighlight: Element is null or undefined. Cannot apply highlight.");
        return;
    }
    element.classList.add('animate-pulse-ring');
    element.style.boxShadow = '0 0 0 4px var(--color-goc-light-accent), 0 0 0 8px rgba(170, 198, 206, 0.4)';
    element.style.outline = '2px solid var(--color-goc-light-accent)';
    element.style.outlineOffset = '2px';
    element.style.zIndex = '10';

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
        element.classList.remove('animate-pulse-ring');
        element.style.boxShadow = '';
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.style.zIndex = '';
    }, duration);
};

const highlightInsightCard = (readingId) => {
    const card = document.querySelector(`.insight-card[data-reading-id="${readingId}"]`);
    if (card) {
        applyHighlight(card);
    } else {
        console.error(`highlightInsightCard: Insight card with data-reading-id="${readingId}" not found for highlighting.`);
    }
};

const highlightConsultingVideoCard = (videoId) => {
    const card = document.querySelector(`.consulting-video-card[data-video-id="${videoId}"]`);
    if (card) {
        applyHighlight(card);
    } else {
        console.error(`highlightConsultingVideoCard: Consulting video card with data-video-id="${videoId}" not found for highlighting.`);
    }
};

// --- Fetch Data ---
const fetchData = async () => {
    try {
        const response = await fetch('data/videos_1.1.json'); // Ensure this path is correct
        const data = await response.json();
        allConsultingVideos = data.filter(video => video.channel === 'consulting');
        return data; // Return all videos
    } catch (error) {
        console.error('Error fetching videos.json:', error);
        return [];
    }
};

// --- Main Channel Rendering ---
const renderMainChannelContent = (videos) => {
    const mainGrid = document.getElementById('mainVideosGrid');
    if (!mainGrid) {
        console.error('mainVideosGrid element not found!');
        return;
    }
    mainGrid.innerHTML = ''; // Clear existing content

    const mainChannelVideos = videos.filter(video => video.channel === 'main');

    // Group videos by season
    const seasons = mainChannelVideos.reduce((acc, video) => {
        const seasonNum = video.season || 'Unsorted';
        if (!acc[seasonNum]) {
            acc[seasonNum] = [];
        }
        acc[seasonNum].push(video);
        return acc;
    }, {});

    // Sort seasons in descending order (most recent first)
    const sortedSeasonNums = Object.keys(seasons).sort((a, b) => {
        if (a === 'Unsorted') return 1;
        if (b === 'Unsorted') return -1;
        return parseInt(b, 10) - parseInt(a, 10);
    });

    sortedSeasonNums.forEach(seasonNum => {
        const seasonBoxWrapper = document.createElement('div');
        seasonBoxWrapper.className = 'bg-[var(--color-goc-dark)] rounded-2xl shadow-xl border border-[var(--color-goc-darkest)] col-span-full mt-8 p-4 md:p-6';
        mainGrid.appendChild(seasonBoxWrapper);

        const seasonHeaderWrapper = document.createElement('div');
        seasonHeaderWrapper.className = 'p-4 md:p-8 bg-[var(--color-goc-dark)] rounded-2xl col-span-full mb-4';
        seasonHeaderWrapper.innerHTML = `
            <h3 class="text-sm font-medium text-[var(--color-goc-light-accent)] opacity-70 mb-2">Games Over Coffee</h3> <h1 class="text-6xl md:text-7xl font-extrabold font-poppins bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text drop-shadow-lg tracking-tight">
                ${seasonNum === 'Unsorted' ? 'Unsorted Episodes' : `Season ${seasonNum}`}
            </h1>
            <p class="text-md text-[var(--color-goc-main-text)] opacity-80 mt-2">${seasons[seasonNum].length} Episodes</p> `;
        seasonBoxWrapper.appendChild(seasonHeaderWrapper);

        const filmstripContainerWrapper = document.createElement('div');
        filmstripContainerWrapper.className = 'relative col-span-full p-4 rounded-lg shadow-inner bg-[var(--color-goc-filmstrip-bg)] border border-[var(--color-goc-darkest)]';

        const seasonVideosContainer = document.createElement('div');
        const seasonContainerId = `season-filmstrip-${seasonNum.replace(/\s/g, '-')}`;
        seasonVideosContainer.id = seasonContainerId;
        seasonVideosContainer.className = 'flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory';

        const leftArrowButton = document.createElement('button');
        leftArrowButton.className = 'absolute left-0 top-1/2 -translate-y-1/2 w-16 h-full bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-center justify-start text-white text-3xl opacity-0 hover:opacity-100 transition-opacity duration-300 z-20 cursor-pointer rounded-l-lg';
        leftArrowButton.innerHTML = '<i class="fas fa-chevron-left ml-2"></i>';
        leftArrowButton.addEventListener('click', () => {
            const scrollContainer = document.getElementById(seasonContainerId);
            if (scrollContainer) {
                const firstCard = scrollContainer.querySelector('.video-card');
                const scrollAmount = firstCard ? (firstCard.offsetWidth + 24) : 0;
                scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        });
        filmstripContainerWrapper.appendChild(leftArrowButton);

        const rightArrowButton = document.createElement('button');
        rightArrowButton.className = 'absolute right-0 top-1/2 -translate-y-1/2 w-16 h-full bg-gradient-to-l from-black/90 via-black/50 to-transparent flex items-center justify-end text-white text-3xl opacity-0 hover:opacity-100 transition-opacity duration-300 z-20 cursor-pointer rounded-r-lg';
        rightArrowButton.innerHTML = '<i class="fas fa-chevron-right mr-2"></i>';
        rightArrowButton.addEventListener('click', () => {
            const scrollContainer = document.getElementById(seasonContainerId);
            if (scrollContainer) {
                const firstCard = scrollContainer.querySelector('.video-card');
                const scrollAmount = firstCard ? (firstCard.offsetWidth + 24) : 0;
                scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        });
        filmstripContainerWrapper.appendChild(rightArrowButton);

        filmstripContainerWrapper.appendChild(seasonVideosContainer);
        seasonBoxWrapper.appendChild(filmstripContainerWrapper);

        seasons[seasonNum].sort((a, b) => (a.episode || 0) - (b.episode || 0)).forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card bg-[var(--color-goc-dark)] rounded-lg shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl relative flex-none w-72 sm:w-80 md:w-96 snap-center';

            const seasonEpisodeText = (() => {
                if (video.season && video.episode) {
                    return `S${video.season} E${video.episode}`;
                } else if (video.episode) {
                    return `E${video.episode}`;
                }
                return '';
            })();

            videoCard.innerHTML = `
                <div class="relative pb-[56.25%] h-0 overflow-hidden">
                    ${seasonEpisodeText ? `<div class="absolute top-2 left-2 bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded-md z-10">${seasonEpisodeText}</div>` : ''}
                    <img src="${video.thumbnailUrl}" alt="${video.title}" class="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg">
                    <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-t-lg">
                        <button class="play-button bg-[var(--color-goc-light-accent)] text-[var(--color-goc-darkest)] p-4 rounded-full shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-[var(--color-goc-light-accent)] focus:ring-opacity-50"
                                data-video-id="${video.videoId}" data-video-title="${video.title}" data-channel="${video.channel}">
                            <i class="fas fa-play text-2xl"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <h4 class="text-xl font-semibold mb-1 text-[var(--color-goc-main-text)]">${video.title}</h4>
                    ${video.gameTitle ? `<p class="text-sm text-[var(--color-goc-main-text)] opacity-70 mb-2">Game: ${video.gameTitle}</p>` : ''}
                    ${video.synopsis ? `<p class="text-sm text-[var(--color-goc-main-text)] opacity-70 mb-3 line-clamp-2">${video.synopsis}</p>` : ''} <p class="text-sm text-[var(--color-goc-main-text)] opacity-80 mt-auto">Channel: Games Over Coffee</p>
                </div>
            `;
            seasonVideosContainer.appendChild(videoCard);
        });
    });

    mainGrid.querySelectorAll('.play-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const videoId = event.currentTarget.dataset.videoId;
            const videoTitle = event.currentTarget.dataset.videoTitle;
            const channel = event.currentTarget.dataset.channel;
            openVideoPlaybackModal(videoId, videoTitle, 'Games Over Coffee');
        });
    });
};

// --- Most Recent Episode Logic ---
const findAndRenderMostRecentVideo = (allVideos) => {
    const mainChannelVideos = allVideos.filter(video => video.channel === 'main');

    // Sort to find the most recent video by season and then episode
    const mostRecentVideo = mainChannelVideos.sort((a, b) => {
        // Handle undefined or non-numeric seasons/episodes gracefully by treating them as lower priority
        const seasonA = a.season === undefined ? -1 : parseInt(a.season, 10);
        const seasonB = b.season === undefined ? -1 : parseInt(b.season, 10);
        const episodeA = a.episode === undefined ? -1 : parseInt(a.episode, 10);
        const episodeB = b.episode === undefined ? -1 : parseInt(b.episode, 10);

        if (seasonB !== seasonA) {
            return seasonB - seasonA; // Sort by season descending
        }
        return episodeB - episodeA; // Then by episode descending within the same season
    })[0]; // Get the first element (most recent)

    if (!mostRecentVideo) {
        console.warn("No main channel videos found to display as most recent.");
        return;
    }

    // ? Debugging line: Log the most recent video found ?
    console.log("Most recent video found:", mostRecentVideo);

    const mostRecentThumbnail = document.getElementById('mostRecentThumbnail');
    const mostRecentTitle = document.getElementById('mostRecentTitle');
    const mostRecentDescription = document.getElementById('mostRecentDescription');
    const playMostRecentBtn = document.getElementById('playMostRecentBtn');
    const watchMostRecentBtn = document.getElementById('watchMostRecentBtn');

    if (mostRecentThumbnail) mostRecentThumbnail.src = mostRecentVideo.thumbnailUrl;
    if (mostRecentTitle) mostRecentTitle.textContent = mostRecentVideo.title;
    if (mostRecentDescription) mostRecentDescription.textContent = mostRecentVideo.synopsis || "No description available.";

    // Add event listeners for the play buttons
    if (playMostRecentBtn) {
        playMostRecentBtn.onclick = () => openVideoPlaybackModal(
            mostRecentVideo.videoId,
            mostRecentVideo.title,
            'Games Over Coffee',
            mostRecentVideo.synopsis
        );
    }
    if (watchMostRecentBtn) {
        watchMostRecentBtn.onclick = () => openVideoPlaybackModal(
            mostRecentVideo.videoId,
            mostRecentVideo.title,
            'Games Over Coffee',
            mostRecentVideo.synopsis
        );
    }
};

// --- Initial Data Fetch & Event Listeners ---
const prefetchReadings = async () => {
    try {
        const response = await fetch('data/readings.json');
        allReadings = await response.json();
    } catch (error) {
        console.error('Error pre-fetching readings.json:', error);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Prefetch all data needed globally
    await prefetchReadings();
    const allVideos = await fetchData(); // This will populate allConsultingVideos and return all videos

    // Render the main channel content on initial load
    renderMainChannelContent(allVideos);

    // Find and render the most recent video
    findAndRenderMostRecentVideo(allVideos);

    // Modal close buttons
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }
    if (closeVideoModalButton) {
        closeVideoModalButton.addEventListener('click', closeVideoModal);
    }

    // Close modals when clicking outside (on the overlay)
    if (readingModal) {
        readingModal.addEventListener('click', (event) => {
            if (event.target === readingModal) {
                closeModal();
            }
        });
    }
    if (videoPlaybackModal) {
        videoPlaybackModal.addEventListener('click', (event) => {
            if (event.target === videoPlaybackModal) {
                closeVideoModal();
            }
        });
    }
});