// Global variable to store all consulting videos once fetched
let allConsultingVideos = [];

// Helper function to format time for consulting video links (MM:SS)
const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Function to load and display videos for the Main Channel
const loadMainChannelVideos = async () => {
    const mainVideosGrid = document.getElementById('mainVideosGrid');
    mainVideosGrid.innerHTML = '<p class="text-center text-gray-400 col-span-full">Loading videos...</p>';

    try {
        const response = await fetch('data/videos.json');
        // Early return if response is not OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const videos = await response.json();
        const mainChannelVideos = videos.filter(video => video.channel === 'main');

        // Early return if no videos are found
        if (mainChannelVideos.length === 0) {
            mainVideosGrid.innerHTML = '<p class="text-center text-gray-400 col-span-full">No videos found for this channel yet.</p>';
            return;
        }

        mainVideosGrid.innerHTML = ''; // Clear loading message

        mainChannelVideos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'bg-gray-800 rounded-xl shadow-xl overflow-hidden flex flex-col group transform hover:scale-105 transition-transform duration-300 ease-in-out';

            const thumbnailUrl = video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
            // Note: autoplay is generally not recommended for user experience unless explicitly requested by a user action.
            // For inline playback, it's common to start automatically once the user clicks to play.
            const youtubeEmbedUrl = `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`;

            videoCard.innerHTML = `
                <div class="relative w-full aspect-video">
                    <img src="${thumbnailUrl}" alt="${video.title}" class="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-75">
                    <button data-video-id="${video.videoId}" class="play-button absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50 rounded-xl">
                        <svg class="w-20 h-20 text-yellow-400 transform transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    <div class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 hidden video-loading-spinner">
                        <svg class="animate-spin h-10 w-10 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>
                <div class="p-5 flex-grow flex flex-col justify-between">
                    <div>
                        <h3 class="text-xl font-semibold mb-2 text-gray-100">${video.title}</h3>
                        <p class="text-gray-400 text-sm">Season ${video.season}, Episode ${video.episode}</p>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-700 flex justify-end">
                        <a href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank" class="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 text-sm font-medium flex items-center">
                            Watch on YouTube
                            <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                    </div>
                </div>
            `;
            mainVideosGrid.appendChild(videoCard);
        });

        // Add event listeners to all play buttons for inline playback
        document.querySelectorAll('.play-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const videoId = event.currentTarget.dataset.videoId;
                const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                const videoContainer = event.currentTarget.parentNode; // The div holding the image and button
                const loadingSpinner = videoContainer.querySelector('.video-loading-spinner');

                // Show spinner
                if (loadingSpinner) {
                    loadingSpinner.classList.remove('hidden');
                }

                // Replace content with iframe
                videoContainer.innerHTML = `
                    <iframe
                        class="w-full h-full rounded-xl"
                        src="${embedUrl}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                `;
            });
        });

    } catch (error) {
        console.error('Error loading main channel videos:', error);
        mainVideosGrid.innerHTML = '<p class="text-center text-red-400 col-span-full">Failed to load videos. Please try again later. Check console for details.</p>';
    }
};

// Function to load data for the Consulting Channel and display initial search prompt
const loadConsultingChannelContent = async () => {
    const consultingSearchResults = document.getElementById('consultingSearchResults');
    consultingSearchResults.innerHTML = '<p class="text-center text-gray-400">Loading consulting data...</p>';

    try {
        const response = await fetch('data/videos.json');
        // Early return if response is not OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const videos = await response.json();
        allConsultingVideos = videos.filter(video => video.channel === 'consulting');

        // Early return if no videos are found
        if (allConsultingVideos.length === 0) {
            consultingSearchResults.innerHTML = '<p class="text-center text-gray-400">No consulting videos found yet.</p>';
            return;
        }

        // Display initial message for search
        consultingSearchResults.innerHTML = '<p class="text-center text-gray-400">Enter keywords above to search consulting insights.</p>';

    } catch (error) {
        console.error('Error loading consulting videos:', error);
        consultingSearchResults.innerHTML = '<p class="text-center text-red-400">Failed to load consulting data. Please try again later. Check console for details.</p>';
    }
};

// Function to perform the search on consulting videos
const searchConsultingVideos = (query) => {
    const consultingSearchResults = document.getElementById('consultingSearchResults');
    
    // If the query is empty, show the initial prompt and return early
    if (!query.trim()) {
        consultingSearchResults.innerHTML = '<p class="text-center text-gray-400">Enter keywords above to search consulting insights.</p>';
        return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const foundResults = [];

    // Iterate through all consulting videos and their subjects
    allConsultingVideos.forEach(video => {
        video.subjects.forEach(subject => {
            const subjectKeywords = subject.keywords.map(kw => kw.toLowerCase());
            const subjectTitle = subject.title.toLowerCase();

            // Check if the query matches any keyword or the subject title
            const keywordMatch = subjectKeywords.some(keyword => keyword.includes(lowerCaseQuery));
            const titleMatch = subjectTitle.includes(lowerCaseQuery);

            if (keywordMatch || titleMatch) {
                // Add relevant details to the results array
                foundResults.push({
                    videoId: video.videoId,
                    videoTitle: video.title,
                    subjectTitle: subject.title,
                    startTime: subject.startTime
                });
            }
        });
    });

    // Display message if no results are found
    if (foundResults.length === 0) {
        consultingSearchResults.innerHTML = `<p class="text-center text-gray-400">No results found for "${query}". Try different keywords.</p>`;
        return;
    }

    // Clear previous results and render new ones
    consultingSearchResults.innerHTML = '';
    foundResults.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'bg-gray-800 rounded-lg shadow-md p-5 flex flex-col sm:flex-row sm:items-center justify-between transition-transform duration-300 hover:scale-[1.02]';
        resultItem.innerHTML = `
            <div>
                <h3 class="text-xl font-semibold mb-1 text-gray-100">${result.videoTitle}</h3>
                <p class="text-yellow-400 text-lg mt-1 font-medium">${result.subjectTitle}</p>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                <button data-video-id="${result.videoId}" data-start-time="${result.startTime}" class="play-consulting-button bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50">
                    Watch from ${formatTime(result.startTime)}
                    <svg class="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
            </div>
        `;
        consultingSearchResults.appendChild(resultItem);
    });

    // Add event listeners for play buttons in consulting search results
    document.querySelectorAll('.play-consulting-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const videoId = event.currentTarget.dataset.videoId;
            const startTime = event.currentTarget.dataset.startTime;
            // Open YouTube video in a new tab with the specified start time
            const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}&t=${startTime}s`;
            window.open(youtubeUrl, '_blank');
        });
    });
};

// Function to handle the tab switching logic
const setupTabs = () => {
    const mainChannelTab = document.getElementById('mainChannelTab');
    const consultingChannelTab = document.getElementById('consultingChannelTab');
    const mainChannelContent = document.getElementById('mainChannelContent');
    const consultingChannelContent = document.getElementById('consultingChannelContent');

    // Function to activate a tab and load its content
    const activateTab = (activeTab, activeContent, inactiveTab, inactiveContent, contentLoader) => {
        // Apply active styles to the active tab
        activeTab.classList.add('border-b-4', 'border-yellow-400', 'text-yellow-400');
        activeTab.classList.remove('text-gray-200');

        // Remove active styles from the inactive tab
        inactiveTab.classList.remove('border-b-4', 'border-yellow-400', 'text-yellow-400');
        inactiveTab.classList.add('text-gray-200');

        // Show active content and hide inactive content
        activeContent.classList.remove('hidden');
        inactiveContent.classList.add('hidden');

        // Load content if a loader function is provided
        if (contentLoader) {
            contentLoader();
        }
    };

    // Initial state: Activate Main Channel tab and load its videos
    activateTab(mainChannelTab, mainChannelContent, consultingChannelTab, consultingChannelContent, loadMainChannelVideos);

    // Event listener for Main Channel tab click
    mainChannelTab.addEventListener('click', () => {
        activateTab(mainChannelTab, mainChannelContent, consultingChannelTab, consultingChannelContent, loadMainChannelVideos);
    });

    // Event listener for Consulting Channel tab click
    consultingChannelTab.addEventListener('click', () => {
        activateTab(consultingChannelTab, consultingChannelContent, mainChannelTab, mainChannelContent, loadConsultingChannelContent);
    });
};

// Ensure DOM is fully loaded before running setup functions
document.addEventListener('DOMContentLoaded', () => {
    setupTabs(); // Initialize tab functionality

    // Attach event listener for the consulting search input
    const consultingSearchInput = document.getElementById('consultingSearchInput');
    if (consultingSearchInput) {
        // Use 'input' event for real-time searching as the user types
        consultingSearchInput.addEventListener('input', (event) => {
            searchConsultingVideos(event.target.value);
        });
    }
});