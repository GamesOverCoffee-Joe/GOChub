// Global variable to store all consulting videos once fetched
let allConsultingVideos = [];
// Global variable to store all readings once fetched
let allReadings = [];
// Global state for current filters/search for insights
let currentInsightFilterType = 'all';
let currentInsightSearchQuery = '';
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
    modalContent.innerHTML = reading.content; // Use .innerHTML for potential HTML formatting in content
    modalSourceLink.href = `https://www.youtube.com/watch?v=${reading.videoId}`;
    readingModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden'); // Prevent background scrolling
};

const closeReadingModal = () => {
    readingModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    modalContent.scrollTop = 0; // Reset scroll position
};

closeModalButton.addEventListener('click', closeReadingModal);
readingModal.addEventListener('click', (event) => {
    // Close modal if clicked outside the content area
    if (event.target === readingModal) {
        closeReadingModal();
    }
});
// --- END READING MODAL FUNCTIONS ---

// --- VIDEO PLAYBACK MODAL FUNCTIONS ---
const videoPlaybackModal = document.getElementById('videoPlaybackModal');
const closeVideoModalButton = document.getElementById('closeVideoModal');
const videoIframe = document.getElementById('videoIframe');
const modalVideoTitle = document.getElementById('modalVideoTitle');

const openVideoModal = (videoId, videoTitle, startTime = 0) => {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0${startTime ? '&start=' + startTime : ''}`;
    videoIframe.src = embedUrl;
    modalVideoTitle.textContent = videoTitle;
    videoPlaybackModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
};

const closeVideoModal = () => {
    videoIframe.src = ''; // Stop video playback
    modalVideoTitle.textContent = ''; // Clear title
    videoPlaybackModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
};

closeVideoModalButton.addEventListener('click', closeVideoModal);
videoPlaybackModal.addEventListener('click', (event) => {
    if (event.target === videoPlaybackModal) {
        closeVideoModal();
    }
});
// --- END VIDEO PLAYBACK MODAL FUNCTIONS ---


// Function to load and display videos for the Main Channel
const loadMainChannelVideos = async () => {
    const mainVideosGrid = document.getElementById('mainVideosGrid');
    mainVideosGrid.innerHTML = '<p class="text-[var(--color-goc-main-text)] text-center col-span-full">Loading videos...</p>';

    try {
        const response = await fetch('data/videos.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const videos = await response.json();
        const mainChannelVideos = videos.filter(video => video.channel === 'main');

        if (mainChannelVideos.length === 0) {
            mainVideosGrid.innerHTML = '<p class="text-[var(--color-goc-main-text)] text-center col-span-full">No videos found for this channel yet.</p>';
            return;
        }

        mainVideosGrid.innerHTML = ''; // Clear loading message

        mainChannelVideos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'bg-[var(--color-goc-dark)] rounded-xl shadow-lg overflow-hidden flex flex-col group transform hover:scale-103 transition-transform duration-300 ease-in-out';

            const thumbnailUrl = video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;

            const relatedReading = findReadingForVideo(video.videoId);
            const readingLinkHtml = relatedReading ? `
                <button data-reading-id="${relatedReading.id}" class="read-insight-button text-[var(--color-goc-light-accent)] hover:text-opacity-80 transition-colors duration-200 text-sm font-medium flex items-center mr-4"> <i class="fas fa-book-open text-base mr-2"></i> Read Insight
                </button>
            ` : '';

            videoCard.innerHTML = `
                <div class="relative w-full aspect-video">
                    <img src="${thumbnailUrl}" alt="${video.title}" class="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-75">
                    <button data-video-id="${video.videoId}" data-video-title="${video.title}" class="play-button absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--color-goc-light-accent)] focus:ring-opacity-50 rounded-xl">
                        <i class="fas fa-play-circle text-6xl text-[var(--color-goc-light-accent)] transform transition-transform duration-300 group-hover:scale-110"></i>
                    </button>
                    <div class="absolute inset-0 flex items-center justify-center bg-[var(--color-goc-darkest)] bg-opacity-75 hidden video-loading-spinner">
                        <i class="fas fa-spinner fa-spin text-4xl text-[var(--color-goc-light-accent)]"></i>
                    </div>
                </div>
                <div class="p-5 flex-grow flex flex-col justify-between">
                    <div>
                        <h3 class="text-xl font-semibold mb-2 text-[var(--color-goc-main-text)]">${video.title}</h3>
                        <p class="text-[var(--color-goc-main-text)] text-sm opacity-80">Season ${video.season}, Episode ${video.episode}</p>
                    </div>
                    <div class="mt-4 pt-4 border-t border-[var(--color-goc-darkest)] flex justify-between items-center">
                        ${readingLinkHtml}
                        <a href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank" class="text-[var(--color-goc-light-accent)] hover:text-opacity-80 transition-colors duration-200 text-sm font-medium flex items-center">
                            Watch on YouTube <i class="fas fa-external-link-alt ml-1 text-xs"></i>
                        </a>
                    </div>
                </div>
            `;
            mainVideosGrid.appendChild(videoCard);
        });

        document.querySelectorAll('.play-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const videoId = event.currentTarget.dataset.videoId;
                const videoTitle = event.currentTarget.dataset.videoTitle;
                openVideoModal(videoId, videoTitle);
            });
        });

        document.querySelectorAll('.read-insight-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const readingId = event.currentTarget.dataset.readingId;
                setupTabs('insightsChannelTab', readingId);
            });
        });

    } catch (error) {
        console.error('Error loading main channel videos:', error);
        mainVideosGrid.innerHTML = '<p class="text-center text-red-400 col-span-full">Failed to load videos. Please try again later. Check console for details.</p>';
    }
};

// Function to load data for the Consulting Channel and display its video cards
const loadConsultingChannelContent = async () => {
    const consultingSearchResults = document.getElementById('consultingSearchResults');
    consultingSearchResults.innerHTML = '<p class="text-center text-[var(--color-goc-main-text)] col-span-full">Loading consulting data...</p>';

    try {
        const response = await fetch('data/videos.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const videos = await response.json();
        allConsultingVideos = videos.filter(video => video.channel === 'consulting');

        if (allConsultingVideos.length === 0) {
            consultingSearchResults.innerHTML = '<p class="text-center text-[var(--color-goc-main-text)] col-span-full">No consulting videos found yet.</p>';
            return;
        }

        consultingSearchResults.innerHTML = '';
        consultingSearchResults.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

        allConsultingVideos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'bg-[var(--color-goc-dark)] rounded-xl shadow-lg overflow-hidden flex flex-col group transform hover:scale-103 transition-transform duration-300 ease-in-out';

            const thumbnailUrl = video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;

            const relatedReading = findReadingForVideo(video.videoId);
            const readingLinkHtml = relatedReading ? `
                <button data-reading-id="${relatedReading.id}" class="read-insight-button text-[var(--color-goc-light-accent)] hover:text-opacity-80 transition-colors duration-200 text-sm font-medium flex items-center mr-4">
                    <i class="fas fa-book-open text-base mr-2"></i> Read Insight
                </button>
            ` : '';

            videoCard.innerHTML = `
                <div class="relative w-full aspect-video">
                    <img src="${thumbnailUrl}" alt="${video.title}" class="w-full h-full object-cover">
                    <button data-video-id="${video.videoId}" data-video-title="${video.title}" class="play-button absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--color-goc-light-accent)] focus:ring-opacity-50 rounded-xl">
                        <i class="fas fa-play-circle text-6xl text-[var(--color-goc-light-accent)] transform transition-transform duration-300 group-hover:scale-110"></i>
                    </button>
                </div>
                <div class="p-5 flex-grow flex flex-col justify-between">
                    <div>
                        <h3 class="text-xl font-semibold mb-2 text-[var(--color-goc-main-text)]">${video.title}</h3>
                    </div>
                    <div class="mt-4 pt-4 border-t border-[var(--color-goc-darkest)] flex justify-between items-center">
                         ${readingLinkHtml}
                        <a href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank" class="text-[var(--color-goc-light-accent)] hover:text-opacity-80 transition-colors duration-200 text-sm font-medium flex items-center">
                            Watch on YouTube <i class="fas fa-external-link-alt ml-1 text-xs"></i>
                        </a>
                    </div>
                </div>
            `;
            consultingSearchResults.appendChild(videoCard);
        });

        // Event listeners for consulting video card play buttons (open modal)
        document.querySelectorAll('.play-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const videoId = event.currentTarget.dataset.videoId;
                const videoTitle = event.currentTarget.dataset.videoTitle;
                openVideoModal(videoId, videoTitle);
            });
        });

        document.querySelectorAll('.read-insight-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const readingId = event.currentTarget.dataset.readingId;
                setupTabs('insightsChannelTab', readingId);
            });
        });

    } catch (error) {
        console.error('Error loading consulting videos:', error);
        consultingSearchResults.innerHTML = '<p class="text-center text-red-400 col-span-full">Failed to load consulting data. Please try again later. Check console for details.</p>';
    }
};

// Function to perform the search on consulting videos
const searchConsultingVideos = (query) => {
    const consultingSearchResults = document.getElementById('consultingSearchResults');

    if (!query.trim()) {
        loadConsultingChannelContent(); // Reload all content if query is empty
        return;
    }

    consultingSearchResults.innerHTML = '<p class="text-center text-[var(--color-goc-main-text)] col-span-full">Searching...</p>';
    consultingSearchResults.className = 'space-y-6'; // Change layout for search results

    const lowerCaseQuery = query.toLowerCase();
    const foundResults = [];

    allConsultingVideos.forEach(video => {
        video.subjects.forEach(subject => {
            const subjectKeywords = subject.keywords.map(kw => kw.toLowerCase());
            const subjectTitle = subject.title.toLowerCase();

            const keywordMatch = subjectKeywords.some(keyword => keyword.includes(lowerCaseQuery));
            const titleMatch = subjectTitle.includes(lowerCaseQuery);

            if (keywordMatch || titleMatch) {
                foundResults.push({
                    videoId: video.videoId,
                    videoTitle: video.title,
                    thumbnailUrl: video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`,
                    subjectTitle: subject.title,
                    startTime: subject.startTime
                });
            }
        });
    });

    if (foundResults.length === 0) {
        consultingSearchResults.innerHTML = `<p class="text-center text-[var(--color-goc-main-text)] col-span-full">No results found for "${query}". Try different keywords.</p>`;
        return;
    }

    consultingSearchResults.innerHTML = '';
    // Restore grid layout for results if desired, or keep as space-y-6 for list view
    consultingSearchResults.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';


    foundResults.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'bg-[var(--color-goc-dark)] rounded-lg shadow-md p-5 flex flex-col sm:flex-row sm:items-center justify-between transition-transform duration-300 hover:scale-[1.02]';
        resultItem.innerHTML = `
            <div class="flex items-center flex-grow">
                <img src="${result.thumbnailUrl}" alt="Thumbnail for ${result.videoTitle}" class="w-24 h-16 object-cover rounded-md mr-4 flex-shrink-0">
                <div>
                    <h3 class="text-xl font-semibold mb-1 text-[var(--color-goc-main-text)]">${result.videoTitle}</h3>
                    <p class="text-[var(--color-goc-light-accent)] text-lg mt-1 font-medium">${result.subjectTitle}</p>
                </div>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                <button data-video-id="${result.videoId}" data-video-title="${result.videoTitle}" data-start-time="${result.startTime}" class="play-consulting-button bg-[var(--color-goc-light-accent)] hover:bg-opacity-80 text-[var(--color-goc-darkest)] font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center focus:outline-none focus:ring-4 focus:ring-[var(--color-goc-light-accent)] focus:ring-opacity-50">
                    Watch from ${formatTime(result.startTime)} <i class="fas fa-play ml-2"></i>
                </button>
            </div>
        `;
        consultingSearchResults.appendChild(resultItem);
    });

    document.querySelectorAll('.play-consulting-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const videoId = event.currentTarget.dataset.videoId;
            const videoTitle = event.currentTarget.dataset.videoTitle;
            const startTime = event.currentTarget.dataset.startTime;
            openVideoModal(videoId, videoTitle, startTime);
        });
    });
};

// Function to generate and display filter buttons for insights
const populateInsightFilterButtons = () => {
    const insightsFilterButtonsContainer = document.getElementById('insightsFilterButtons');
    // Clear existing buttons except 'All'
    insightsFilterButtonsContainer.querySelectorAll('button:not([data-filter-type="all"])').forEach(button => button.remove());

    const uniqueTypes = new Set(allReadings.map(reading => reading.type));

    uniqueTypes.forEach(type => {
        const button = document.createElement('button');
        button.dataset.filterType = type;
        button.className = 'insights-filter-button bg-[var(--color-goc-dark)] hover:bg-[var(--color-goc-light-accent)] hover:text-[var(--color-goc-darkest)] text-[var(--color-goc-main-text)] py-2 px-4 rounded-full transition duration-300 ease-in-out text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-goc-light-accent)] focus:ring-opacity-50';
        button.textContent = type;
        insightsFilterButtonsContainer.appendChild(button);
    });

    // Add event listeners using delegation on the container
    insightsFilterButtonsContainer.addEventListener('click', (event) => {
        const targetButton = event.target.closest('.insights-filter-button');
        if (targetButton) {
            currentInsightFilterType = targetButton.dataset.filterType;
            // Clear search input when a filter button is clicked
            document.getElementById('insightsSearchInput').value = '';
            currentInsightSearchQuery = '';
            loadInsightsContent(); // Re-render content with the new filter
        }
    });

    // Event listener for Clear Filters button
    document.getElementById('clearInsightsFilters').addEventListener('click', () => {
        currentInsightFilterType = 'all';
        currentInsightSearchQuery = '';
        document.getElementById('insightsSearchInput').value = ''; // Clear search input
        loadInsightsContent(); // Re-render content with no filters
    });
};


// New function to load and display insights from readings.json
const loadInsightsContent = async () => {
    const insightsGrid = document.getElementById('insightsGrid');
    insightsGrid.innerHTML = '<p class="text-center text-[var(--color-goc-main-text)] col-span-full">Loading insights...</p>';

    // Ensure allReadings are loaded before filtering
    if (allReadings.length === 0) {
        try {
            const response = await fetch('data/readings.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allReadings = await response.json();
            console.log("Readings prefetched:", allReadings.length);
        } catch (error) {
            console.error('Error pre-fetching readings.json:', error);
            insightsGrid.innerHTML = '<p class="text-center text-red-400 col-span-full">Failed to load insights data. Please try again later.</p>';
            return;
        }
        // Populate filter buttons after initial load of allReadings
        populateInsightFilterButtons();
    }

    let filteredReadings = allReadings;

    // Apply type filter
    if (currentInsightFilterType !== 'all') {
        filteredReadings = filteredReadings.filter(reading => reading.type === currentInsightFilterType);
    }

    // Apply search query filter
    if (currentInsightSearchQuery) {
        const lowerCaseQuery = currentInsightSearchQuery.toLowerCase();
        filteredReadings = filteredReadings.filter(reading =>
            reading.title.toLowerCase().includes(lowerCaseQuery) ||
            reading.description.toLowerCase().includes(lowerCaseQuery) ||
            reading.content.toLowerCase().includes(lowerCaseQuery) // Search in full content as well
        );
    }

    if (filteredReadings.length === 0) {
        insightsGrid.innerHTML = '<p class="text-center text-[var(--color-goc-main-text)] col-span-full">No insights found matching your criteria.</p>';
        return;
    }

    insightsGrid.innerHTML = '';
    insightsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

    filteredReadings.forEach(reading => {
        const insightCard = document.createElement('div');
        insightCard.id = `reading-${reading.id}`;
        insightCard.className = 'bg-[var(--color-goc-dark)] rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:scale-103 transition-transform duration-300 ease-in-out';

        insightCard.innerHTML = `
            <div>
                <h3 class="text-xl font-semibold mb-2 text-[var(--color-goc-light-accent)]">${reading.title}</h3>
                <p class="text-[var(--color-goc-main-text)] text-sm mb-4">Type: <span class="font-medium opacity-90">${reading.type}</span></p>
                <p class="text-[var(--color-goc-main-text)] text-base leading-relaxed opacity-90">${reading.description}</p>
            </div>
            <div class="mt-6 pt-4 border-t border-[var(--color-goc-darkest)] flex flex-col items-start gap-y-2">
                <button data-reading-id="${reading.id}" class="open-reading-modal-button text-[var(--color-goc-light-accent)] hover:text-opacity-80 transition-colors duration-200 text-sm font-medium flex items-center">
                    Read Full Insight <i class="fas fa-arrow-right ml-2 text-sm"></i>
                </button>
                <a href="https://www.youtube.com/watch?v=${reading.videoId}" target="_blank" class="text-[var(--color-goc-main-text)] hover:text-[var(--color-goc-light-accent)] transition-colors duration-200 text-sm font-medium flex items-center">
                    <i class="fab fa-youtube text-base mr-2"></i> View Source
                </a>
            </div>
        `;
        insightsGrid.appendChild(insightCard);
    });

    // Event listeners for opening the modal
    document.querySelectorAll('.open-reading-modal-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const readingId = event.currentTarget.dataset.readingId;
            const selectedReading = allReadings.find(r => r.id === readingId);
            if (selectedReading) {
                openReadingModal(selectedReading);
            } else {
                console.error("Reading not found for ID:", readingId);
            }
        });
    });

    // Update active state of filter buttons
    document.querySelectorAll('.insights-filter-button').forEach(button => {
        if (button.dataset.filterType === currentInsightFilterType) {
            button.classList.add('bg-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-darkest)]'); // Active state colors
            button.classList.remove('bg-[var(--color-goc-dark)]', 'text-[var(--color-goc-main-text)]'); // Inactive state colors
        } else {
            button.classList.remove('bg-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-darkest)]'); // Active state colors
            button.classList.add('bg-[var(--color-goc-dark)]', 'text-[var(--color-goc-main-text)]'); // Inactive state colors
        }
    });
};

// Function to scroll to a specific reading card
const scrollToReading = (readingId) => {
    const targetElement = document.getElementById(`reading-${readingId}`);
    if (targetElement) {
        console.log(`Attempting to scroll to and highlight reading ID: ${readingId}`, targetElement);
        setTimeout(() => {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            targetElement.classList.add('ring-4', 'ring-[var(--color-goc-light-accent)]', 'ring-opacity-70', 'animate-pulse-ring');
            console.log(`Highlight classes added to:`, targetElement);

            setTimeout(() => {
                targetElement.classList.remove('ring-4', 'ring-[var(--color-goc-light-accent)]', 'ring-opacity-70', 'animate-pulse-ring');
                console.log(`Highlight classes removed from:`, targetElement);
            }, 2000);
        }, 250);
    } else {
        console.warn(`Target reading element with ID 'reading-${readingId}' not found for scrolling.`);
    }
};


// Function to handle the tab switching logic
const setupTabs = async (targetTabId = 'mainChannelTab', scrollTargetId = null) => {
    const tabs = {
        mainChannelTab: {
            button: document.getElementById('mainChannelTab'),
            content: document.getElementById('mainChannelContent'),
            loader: loadMainChannelVideos,
            resetScroll: true // Main channel resets scroll to top
        },
        consultingChannelTab: {
            button: document.getElementById('consultingChannelTab'),
            content: document.getElementById('consultingChannelContent'),
            loader: loadConsultingChannelContent,
            resetScroll: false // Consulting channel attempts to maintain scroll
        },
        insightsChannelTab: {
            button: document.getElementById('insightsChannelTab'),
            content: document.getElementById('insightsContent'),
            loader: loadInsightsContent,
            resetScroll: false // Insights channel attempts to maintain scroll, unless specific insight is targeted
        }
    };

    // Store current scroll position before switching tabs
    lastScrollY = window.scrollY;

    Object.values(tabs).forEach(tab => {
        tab.button.classList.remove('border-b-4', 'border-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-light-accent)]');
        tab.button.classList.add('text-[var(--color-goc-main-text)]');
        tab.content.classList.add('hidden');
    });

    const activeTab = tabs[targetTabId];
    if (activeTab) {
        activeTab.button.classList.add('border-b-4', 'border-[var(--color-goc-light-accent)]', 'text-[var(--color-goc-light-accent)]');
        activeTab.button.classList.remove('text-[var(--color-goc-main-text)]');
        activeTab.content.classList.remove('hidden');

        await activeTab.loader(); // Call loader function for the active tab

        // Restore scroll position unless the tab is explicitly set to reset, or if a specific insight is targeted
        if (!activeTab.resetScroll && !scrollTargetId) {
            window.scrollTo(0, lastScrollY);
        } else if (activeTab.resetScroll) {
            window.scrollTo(0, 0); // Always scroll to top if resetScroll is true
        }

        if (targetTabId === 'insightsChannelTab' && scrollTargetId) {
            scrollToReading(scrollTargetId);
        }
    }
};

// Pre-fetches readings.json once on initial load to make data available globally
const prefetchReadings = async () => {
    // Early return if readings are already loaded
    if (allReadings.length > 0) {
        return;
    }
    try {
        const response = await fetch('data/readings.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allReadings = await response.json();
        console.log("Readings prefetched:", allReadings.length);
        // Populate filter buttons immediately after prefetching
        populateInsightFilterButtons();
    } catch (error) {
        console.error('Error pre-fetching readings.json:', error);
    }
};


document.addEventListener('DOMContentLoaded', async () => {
    await prefetchReadings(); // Prefetch readings as soon as DOM is ready

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
            searchConsultingVideos(event.target.value);
        });
    }

    // Event listener for Insights search input
    const insightsSearchInput = document.getElementById('insightsSearchInput');
    if (insightsSearchInput) {
        insightsSearchInput.addEventListener('input', (event) => {
            currentInsightSearchQuery = event.target.value;
            loadInsightsContent(); // Re-render content with the new search query
        });
    }
});