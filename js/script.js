// Global variable to store all consulting videos once fetched
let allConsultingVideos = [];
// Global variable to store all readings once fetched
let allReadings = [];
// Global state for current filters/search for insights
let currentInsightFilterType = 'all';
let currentInsightSearchQuery = '';
// NEW: Global state for current filter for consulting videos
let currentConsultingFilterType = 'all';
let currentConsultingSearchQuery = ''; // Keep track of consulting search query

// Global variable to store scroll position when switching tabs
let lastScrollY = 0;


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
    modalSourceLink.href = `https://www.youtube.com/watch?v=${reading.videoId}`;
    modalSourceLink.textContent = reading.linkText || 'View Source Video'; // Use linkText or default
    readingModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden'); // Prevent scrolling body
};

const closeModal = () => {
    readingModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    // Re-enable body scroll if video modal is also closed
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


const openVideoPlaybackModal = (videoId, title, channel, description = '', startTime = 0) => {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&start=${startTime}`;
    videoIframe.src = embedUrl;
    videoModalTitle.textContent = title;
    videoModalChannel.textContent = `Channel: ${channel}`;
    videoModalDescription.textContent = description; // Set description
    videoPlaybackModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden'); // Prevent scrolling body
};

const closeVideoModal = () => {
    videoIframe.src = ''; // Stop video playback
    videoPlaybackModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    // Re-enable body scroll if reading modal is also closed
    if (readingModal.classList.contains('hidden')) {
        document.body.classList.remove('overflow-hidden');
    }
};

// --- FETCH DATA ---
const fetchData = async () => {
    try {
        const response = await fetch('data/videos.json'); // Updated path
        const data = await response.json();
        allConsultingVideos = data.filter(video => video.channel === 'consulting');
        return data; // Return all videos
    } catch (error) {
        console.error('Error fetching videos.json:', error);
        return [];
    }
};

// --- MAIN CHANNEL RENDERING ---
const renderMainChannelContent = (videos) => {
    const mainGrid = document.getElementById('mainVideosGrid'); // Corrected ID
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

    Object.keys(seasons).sort((a, b) => {
        if (a === 'Unsorted') return 1;
        if (b === 'Unsorted') return -1;
        return parseInt(a, 10) - parseInt(b, 10);
    }).forEach(seasonNum => {
        const seasonHeader = document.createElement('h3');
        seasonHeader.className = 'text-2xl md:text-3xl font-bold mb-6 text-[var(--color-goc-light-accent)] col-span-full mt-8';
        seasonHeader.textContent = seasonNum === 'Unsorted' ? 'Unsorted Episodes' : `Season ${seasonNum}`;
        mainGrid.appendChild(seasonHeader);

        seasons[seasonNum].sort((a, b) => (a.episode || 0) - (b.episode || 0)).forEach(video => {
            const videoCard = document.createElement('div');
            // Removed hover effect
            videoCard.className = 'bg-[var(--color-goc-dark)] rounded-lg shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300';
            videoCard.innerHTML = `
                <div class="relative pb-[56.25%] h-0 overflow-hidden">
                    <img src="${video.thumbnailUrl}" alt="${video.title}" class="absolute top-0 left-0 w-full h-full object-cover">
                    <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <button class="play-button bg-[var(--color-goc-light-accent)] text-[var(--color-goc-darkest)] p-4 rounded-full shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-[var(--color-goc-light-accent)] focus:ring-opacity-50"
                                data-video-id="${video.videoId}" data-video-title="${video.title}" data-channel="${video.channel}">
                            <i class="fas fa-play text-2xl"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <h4 class="text-xl font-semibold mb-2 text-[var(--color-goc-main-text)]">${video.title}</h4>
                    <p class="text-sm text-[var(--color-goc-main-text)] opacity-80 mt-auto">Channel: ${video.channel}</p>
                </div>
            `;
            mainGrid.appendChild(videoCard);
        });
    });

    mainGrid.querySelectorAll('.play-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const videoId = event.currentTarget.dataset.videoId;
            const videoTitle = event.currentTarget.dataset.videoTitle;
            const channel = event.currentTarget.dataset.channel;
            openVideoPlaybackModal(videoId, videoTitle, channel);
        });
    });
};

// --- CONSULTING CHANNEL RENDERING & SEARCH ---

// NEW: Populate filter buttons for consulting videos
const populateConsultingFilterButtons = () => {
    const consultingFilterButtonsContainer = document.getElementById('consultingFilterButtons');
    // Clear existing buttons except 'All'
    consultingFilterButtonsContainer.querySelectorAll('button:not([data-filter-type="all"])').forEach(button => button.remove());

    const allTags = new Set();
    allConsultingVideos.forEach(video => {
        if (video.tags) { // Ensure video.tags exists
            video.tags.forEach(tag => allTags.add(tag.toLowerCase()));
        }
    });

    const sortedTags = Array.from(allTags).sort();

    sortedTags.forEach(tag => {
        const button = document.createElement('button');
        button.className = 'consulting-filter-button bg-[var(--color-goc-darkest)] text-[var(--color-goc-main-text)] py-2 px-4 rounded-full hover:bg-[var(--color-goc-light-accent)] hover:text-[var(--color-goc-darkest)] transition duration-300 ease-in-out text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-goc-light-accent)] focus:ring-opacity-50';
        button.dataset.filterType = tag;
        button.textContent = tag.charAt(0).toUpperCase() + tag.slice(1); // Capitalize first letter
        consultingFilterButtonsContainer.appendChild(button);
    });

    // Add event listeners for filter buttons
    consultingFilterButtonsContainer.querySelectorAll('.consulting-filter-button').forEach(button => {
        button.addEventListener('click', (event) => {
            currentConsultingFilterType = event.target.dataset.filterType;
            // Remove active class from all buttons
            consultingFilterButtonsContainer.querySelectorAll('.consulting-filter-button').forEach(btn => {
                btn.classList.remove('bg-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-darkest)]');
                btn.classList.add('bg-[var(--color-goc-darkest)]', 'text-[var(--color-goc-main-text)]');
            });
            // Add active class to clicked button
            event.target.classList.remove('bg-[var(--color-goc-darkest)]', 'text-[var(--color-goc-main-text)]');
            event.target.classList.add('bg-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-darkest)]');

            searchConsultingVideos(currentConsultingSearchQuery); // Re-run search with new filter
        });
    });

    // Set 'All' as active initially
    consultingFilterButtonsContainer.querySelector('[data-filter-type="all"]').classList.remove('bg-[var(--color-goc-darkest)]', 'text-[var(--color-goc-main-text)]');
    consultingFilterButtonsContainer.querySelector('[data-filter-type="all"]').classList.add('bg-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-darkest)]');
};


const renderConsultingContent = (videosToRender) => {
    const consultingGrid = document.getElementById('consultingGrid');
    if (!consultingGrid) {
        console.error('consultingGrid element not found!');
        return;
    }
    // Set grid classes
    consultingGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'; // Changed to grid layout
    consultingGrid.innerHTML = ''; // Clear existing content

    if (videosToRender.length === 0) {
        consultingGrid.innerHTML = '<p class="text-center text-lg text-[var(--color-goc-main-text)] opacity-70 col-span-full">No results found for your search/filters.</p>';
        return;
    }

    videosToRender.forEach(video => {
        const videoCard = document.createElement('div');
        // Removed hover effect
        videoCard.className = 'consulting-video-card bg-[var(--color-goc-dark)] rounded-lg shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300';
        videoCard.innerHTML = `
            <div class="relative pb-[56.25%] h-0 overflow-hidden">
                <img src="${video.thumbnailUrl}" alt="${video.title}" class="absolute top-0 left-0 w-full h-full object-cover">
                <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <button class="play-button bg-[var(--color-goc-light-accent)] text-[var(--color-goc-darkest)] p-4 rounded-full shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-[var(--color-goc-light-accent)] focus:ring-opacity-50"
                            data-video-id="${video.videoId}" data-video-title="${video.title}" data-channel="${video.channel}">
                        <i class="fas fa-play text-2xl"></i>
                    </button>
                </div>
            </div>
            <div class="p-6 flex flex-col flex-grow">
                <h3 class="text-xl font-semibold mb-2 text-[var(--color-goc-main-text)] leading-tight">${video.title}</h3>
                <div class="flex flex-wrap gap-2 mb-3" id="consultingVideoTags-${video.videoId}">
                    </div>
                <div class="mt-auto flex flex-col gap-2">
                    ${video.subjects.map(subject => `
                        <button class="flex justify-between items-center bg-[var(--color-goc-darkest)] hover:bg-[var(--color-goc-light-accent)] hover:text-[var(--color-goc-darkest)] text-[var(--color-goc-main-text)] py-2 px-3 rounded-md transition-colors duration-200 text-left text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-goc-light-accent)] focus:ring-opacity-50 subject-button"
                                data-video-id="${video.videoId}" data-start-time="${subject.startTime}">
                            <span>${subject.title}</span>
                            <span class="text-xs opacity-70 ml-2">${formatTime(subject.startTime)}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="px-6 pb-6 flex justify-between items-center mt-auto">
                <button class="view-reading-button text-[var(--color-goc-light-accent)] hover:text-opacity-80 transition-colors duration-200 text-sm font-medium flex items-center"
                        data-video-id="${video.videoId}">
                    View Insight <i class="fas fa-book-open ml-2 text-xs"></i>
                </button>
                <button class="play-full-video-button text-[var(--color-goc-light-accent)] hover:text-opacity-80 transition-colors duration-200 text-sm font-medium flex items-center"
                        data-video-id="${video.videoId}" data-video-title="${video.title}" data-channel="${video.channel}">
                    Play Full Video <i class="fas fa-external-link-alt ml-2 text-xs"></i>
                </button>
            </div>
        `;
        consultingGrid.appendChild(videoCard);

        // Inject tags into the card
        const tagsContainer = document.getElementById(`consultingVideoTags-${video.videoId}`);
        if (video.tags && tagsContainer) {
            video.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'text-xs font-medium bg-blue-700 px-2 py-1 rounded-full text-white opacity-80';
                tagSpan.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
                tagsContainer.appendChild(tagSpan);
            });
        }
    });

    // Add event listeners to subject buttons
    consultingGrid.querySelectorAll('.subject-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const videoId = event.currentTarget.dataset.videoId;
            const startTime = event.currentTarget.dataset.startTime;
            const video = allConsultingVideos.find(v => v.videoId === videoId);
            const videoTitle = video ? video.title : '';
            openVideoPlaybackModal(videoId, videoTitle, 'consulting', '', startTime); // Pass start time for direct jump
        });
    });

    // Add event listeners to "View Insight" buttons
    consultingGrid.querySelectorAll('.view-reading-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const videoId = event.currentTarget.dataset.videoId;
            const reading = findReadingForVideo(videoId);
            if (reading) {
                openReadingModal(reading);
            } else {
                alert('No reading found for this video.');
            }
        });
    });

    // Add event listeners to "Play Full Video" buttons on consulting cards
    consultingGrid.querySelectorAll('.play-button').forEach(button => { // Target the play buttons on consulting cards
        button.addEventListener('click', (event) => {
            const videoId = event.currentTarget.dataset.videoId;
            const videoTitle = event.currentTarget.dataset.videoTitle;
            const channel = event.currentTarget.dataset.channel;
            openVideoPlaybackModal(videoId, videoTitle, channel);
        });
    });

    consultingGrid.querySelectorAll('.play-full-video-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const videoId = event.currentTarget.dataset.videoId;
            const videoTitle = event.currentTarget.dataset.videoTitle;
            const channel = event.currentTarget.dataset.channel;
            openVideoPlaybackModal(videoId, videoTitle, channel);
        });
    });
};


const searchConsultingVideos = (query = '') => {
    currentConsultingSearchQuery = query.toLowerCase();
    let filteredVideos = [...allConsultingVideos]; // Start with all consulting videos

    // 1. Filter by selected tag
    if (currentConsultingFilterType !== 'all') {
        filteredVideos = filteredVideos.filter(video =>
            video.tags && video.tags.includes(currentConsultingFilterType.toLowerCase())
        );
    }

    // 2. Apply text search if query is not empty
    if (currentConsultingSearchQuery) {
        filteredVideos = filteredVideos.filter(video => {
            const videoTitleMatch = video.title.toLowerCase().includes(currentConsultingSearchQuery);
            const subjectMatch = video.subjects.some(subject =>
                subject.title.toLowerCase().includes(currentConsultingSearchQuery) ||
                (subject.keywords && subject.keywords.some(keyword => keyword.toLowerCase().includes(currentConsultingSearchQuery)))
            );
            return videoTitleMatch || subjectMatch;
        });
    }

    renderConsultingContent(filteredVideos);
};

// --- INSIGHTS CHANNEL RENDERING & SEARCH ---
const renderInsightsContent = (readingsToRender) => {
    const insightsGrid = document.getElementById('insightsGrid');
    if (!insightsGrid) {
        console.error('insightsGrid element not found!');
        return;
    }
    insightsGrid.innerHTML = '';

    if (readingsToRender.length === 0) {
        insightsGrid.innerHTML = '<p class="text-center text-lg text-[var(--color-goc-main-text)] opacity-70 col-span-full">No insights found for your search/filters.</p>';
        return;
    }

    readingsToRender.forEach(reading => {
        const insightCard = document.createElement('div');
        insightCard.className = 'bg-[var(--color-goc-dark)] rounded-lg shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl';
        insightCard.innerHTML = `
            <div class="p-6 flex flex-col flex-grow">
                <h4 class="text-xl font-semibold mb-2 text-[var(--color-goc-main-text)]">${reading.title}</h4>
                <div class="flex flex-wrap gap-2 mb-3">
                    <span class="text-xs font-medium bg-purple-700 px-2 py-1 rounded-full text-white opacity-80">${reading.type}</span>
                    </div>
                <p class="text-base text-[var(--color-goc-main-text)] opacity-80 mb-4 flex-grow">${reading.description}</p>
                <div class="mt-auto flex justify-between items-center">
                    <button class="view-details-button text-[var(--color-goc-light-accent)] hover:text-opacity-80 transition-colors duration-200 text-sm font-medium flex items-center"
                            data-reading-id="${reading.id}">
                        Read Full Insight <i class="fas fa-arrow-right ml-2 text-xs"></i>
                    </button>
                    <a href="https://www.youtube.com/watch?v=${reading.videoId}" target="_blank" class="text-[var(--color-goc-main-text)] opacity-70 hover:text-[var(--color-goc-light-accent)] transition-colors duration-200 text-sm font-medium flex items-center">
                        Source Video <i class="fas fa-external-link-alt ml-2 text-xs"></i>
                    </a>
                </div>
            </div>
        `;
        insightsGrid.appendChild(insightCard);
    });

    insightsGrid.querySelectorAll('.view-details-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const readingId = event.currentTarget.dataset.readingId;
            const reading = allReadings.find(r => r.id === readingId);
            if (reading) {
                openReadingModal(reading);
            }
        });
    });
};

const loadInsightsContent = () => {
    let filteredReadings = [...allReadings];

    // 1. Filter by type
    if (currentInsightFilterType !== 'all') {
        filteredReadings = filteredReadings.filter(reading =>
            reading.type.toLowerCase() === currentInsightFilterType
        );
    }

    // 2. Apply search query
    if (currentInsightSearchQuery) {
        const query = currentInsightSearchQuery.toLowerCase();
        filteredReadings = filteredReadings.filter(reading =>
            reading.title.toLowerCase().includes(query) ||
            reading.description.toLowerCase().includes(query) ||
            reading.content.toLowerCase().includes(query)
        );
    }

    renderInsightsContent(filteredReadings);
};

const populateInsightFilterButtons = () => {
    const insightsFilterButtonsContainer = document.getElementById('insightsFilterButtons');
    // Clear existing buttons except 'All'
    insightsFilterButtonsContainer.querySelectorAll('button:not([data-filter-type="all"])').forEach(button => button.remove());

    const allTypes = new Set();
    allReadings.forEach(reading => allTypes.add(reading.type.toLowerCase()));

    const sortedTypes = Array.from(allTypes).sort();

    sortedTypes.forEach(type => {
        const button = document.createElement('button');
        button.className = 'insights-filter-button bg-[var(--color-goc-darkest)] text-[var(--color-goc-main-text)] py-2 px-4 rounded-full hover:bg-[var(--color-goc-light-accent)] hover:text-[var(--color-goc-darkest)] transition duration-300 ease-in-out text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-goc-light-accent)] focus:ring-opacity-50';
        button.dataset.filterType = type;
        button.textContent = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize first letter
        insightsFilterButtonsContainer.appendChild(button);
    });

    // Add event listeners for filter buttons
    insightsFilterButtonsContainer.querySelectorAll('.insights-filter-button').forEach(button => {
        button.addEventListener('click', (event) => {
            currentInsightFilterType = event.target.dataset.filterType;
            // Remove active class from all buttons
            insightsFilterButtonsContainer.querySelectorAll('.insights-filter-button').forEach(btn => {
                btn.classList.remove('bg-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-darkest)]');
                btn.classList.add('bg-[var(--color-goc-darkest)]', 'text-[var(--color-goc-main-text)]');
            });
            // Add active class to clicked button
            event.target.classList.remove('bg-[var(--color-goc-darkest)]', 'text-[var(--color-goc-main-text)]');
            event.target.classList.add('bg-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-darkest)]');

            loadInsightsContent(); // Re-render content with new filter
        });
    });

    // Event listener for clear insights filters button
    document.getElementById('clearInsightsFilters').addEventListener('click', () => {
        currentInsightFilterType = 'all';
        currentInsightSearchQuery = '';
        document.getElementById('insightsSearchInput').value = '';
        insightsFilterButtonsContainer.querySelector('[data-filter-type="all"]').click(); // Programmatically click "All"
        loadInsightsContent();
    });

    // Set 'All' as active initially
    insightsFilterButtonsContainer.querySelector('[data-filter-type="all"]').classList.remove('bg-[var(--color-goc-darkest)]', 'text-[var(--color-goc-main-text)]');
    insightsFilterButtonsContainer.querySelector('[data-filter-type="all"]').classList.add('bg-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-darkest)]');
};

// --- TAB MANAGEMENT ---
const setupTabs = async (activeTabId) => {
    lastScrollY = window.scrollY; // Save current scroll position

    // Hide all channel content sections
    document.querySelectorAll('.channel-content').forEach(section => {
        section.classList.add('hidden');
    });

    // Deactivate all tabs by reverting their styles
    document.querySelectorAll('nav button').forEach(button => { // Target nav buttons specifically
        button.classList.remove('border-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-light-accent)]', 'border-b-4');
        button.classList.add('hover:border-b-4', 'hover:border-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-main-text)]');
    });

    // Activate the selected tab and show its content
    const activeTabButton = document.getElementById(activeTabId);
    if (activeTabButton) {
        // Apply active styles
        activeTabButton.classList.remove('hover:border-b-4', 'hover:border-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-main-text)]');
        activeTabButton.classList.add('border-b-4', 'border-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-light-accent)]');

        if (activeTabId === 'mainChannelTab') {
            document.getElementById('mainChannelContent').classList.remove('hidden'); // Corrected ID
            const allVideos = await fetchData(); // Fetch all videos here
            renderMainChannelContent(allVideos);
            // Restore scroll position only if returning to previously visited tab, otherwise scroll to top
            if (lastScrollY > 0 && document.body.dataset.lastTab === activeTabId) {
                window.scrollTo(0, lastScrollY);
            } else {
                window.scrollTo(0, 0);
            }
        } else if (activeTabId === 'consultingChannelTab') {
            document.getElementById('consultingChannelContent').classList.remove('hidden'); // Corrected ID
            // Ensure allConsultingVideos is populated from fetchData
            if (allConsultingVideos.length === 0) {
                await fetchData(); // This will populate allConsultingVideos
            }
            populateConsultingFilterButtons(); // Populate filter buttons for consulting
            searchConsultingVideos(currentConsultingSearchQuery); // Render initial content (or filtered)
            // Restore scroll position
            if (lastScrollY > 0 && document.body.dataset.lastTab === activeTabId) {
                window.scrollTo(0, lastScrollY);
            } else {
                window.scrollTo(0, 0);
            }
        } else if (activeTabId === 'insightsChannelTab') {
            document.getElementById('insightsContent').classList.remove('hidden');
            // Ensure allReadings is populated
            if (allReadings.length === 0) {
                await prefetchReadings();
            }
            populateInsightFilterButtons(); // Ensure filter buttons are populated/refreshed
            loadInsightsContent(); // Load content based on current filters/search
            // Restore scroll position
            if (lastScrollY > 0 && document.body.dataset.lastTab === activeTabId) {
                window.scrollTo(0, lastScrollY);
            } else {
                window.scrollTo(0, 0);
            }
        }
    }
    document.body.dataset.lastTab = activeTabId; // Store the last active tab
};

// --- Initial Data Fetch & Event Listeners ---
const prefetchReadings = async () => {
    try {
        const response = await fetch('data/readings.json'); // Updated path
        allReadings = await response.json();
        // Populate filter buttons immediately after prefetching
        // No longer calling populateInsightFilterButtons here, it's called in setupTabs
    } catch (error) {
        console.error('Error pre-fetching readings.json:', error);
    }
};


document.addEventListener('DOMContentLoaded', async () => {
    // Prefetch all data needed globally
    await prefetchReadings();
    await fetchData(); // This will populate allConsultingVideos

    // Setup initial tab
    setupTabs('mainChannelTab');

    // Add event listeners for tab switching
    document.getElementById('mainChannelTab').addEventListener('click', () => setupTabs('mainChannelTab'));
    document.getElementById('consultingChannelTab').addEventListener('click', () => setupTabs('consultingChannelTab'));
    document.getElementById('insightsChannelTab').addEventListener('click', () => setupTabs('insightsChannelTab'));

    // Event listener for Consulting search input
    const consultingSearchInput = document.getElementById('consultingSearchInput');
    if (consultingSearchInput) {
        consultingSearchInput.addEventListener('input', (event) => {
            currentConsultingSearchQuery = event.target.value; // Update global query
            searchConsultingVideos(currentConsultingSearchQuery);
        });
    }

    // NEW: Event listener for clearing consulting filters
    document.getElementById('clearConsultingFilters').addEventListener('click', () => {
        currentConsultingFilterType = 'all';
        currentConsultingSearchQuery = '';
        document.getElementById('consultingSearchInput').value = '';
        document.getElementById('consultingFilterButtons').querySelector('[data-filter-type="all"]').click(); // Programmatically click "All"
        searchConsultingVideos();
    });

    // Event listener for Insights search input
    const insightsSearchInput = document.getElementById('insightsSearchInput');
    if (insightsSearchInput) {
        insightsSearchInput.addEventListener('input', (event) => {
            currentInsightSearchQuery = event.target.value;
            loadInsightsContent(); // Re-render content with the new search query
        });
    }

    // Modal close buttons
    closeModalButton.addEventListener('click', closeModal);
    closeVideoModalButton.addEventListener('click', closeVideoModal);

    // Close modals when clicking outside (on the overlay)
    readingModal.addEventListener('click', (event) => {
        if (event.target === readingModal) {
            closeModal();
        }
    });
    videoPlaybackModal.addEventListener('click', (event) => {
        if (event.target === videoPlaybackModal) {
            closeVideoModal();
        }
    });
});