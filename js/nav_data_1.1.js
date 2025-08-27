// nav_data.js

// Define the navigation links in a single JavaScript array.
// This is your single source of truth for the navigation data.
const navigationLinks = [
    {
        name: 'Home',
        href: 'index.html',
        titleSuffix: '',
        classes: 'text-[var(--color-goc-main-text)] hover:text-[var(--color-goc-light-accent)] transition-colors duration-300 relative group'
    },
    {
        name: 'Consulting',
        href: 'gocc.html',
        titleSuffix: ' - Consulting',
        classes: 'text-[var(--color-goc-main-text)] hover:text-[var(--color-goc-light-accent)] transition-colors duration-300 relative group'
    },
    {
        name: 'Lore',
        href: 'lore.html',
        titleSuffix: ' - Lore',
        classes: 'text-[var(--color-goc-main-text)] hover:text-[var(--color-goc-light-accent)] transition-colors duration-300 relative group'
    },
    {
        name: 'Insights',
        href: 'insights.html',
        titleSuffix: ' - Insights',
        classes: 'animate-rainbow hover: transition-colors duration-300 relative group'
    },
    {
        name: 'YouTube',
        href: 'https://www.youtube.com/@GamesOverCoffee',
        target: '_blank',
        titleSuffix: ' - YouTube',
        classes: 'text-[var(--color-goc-main-text)] hover:text-[var(--color-goc-light-accent)] transition-colors duration-300 relative group hidden md:flex items-center space-x-1',
        icon: '<i class="fab fa-youtube text-red-500 text-lg"></i>'
    },
    {
        name: 'Consulting YT',
        href: 'https://www.youtube.com/@GamesOverCoffeeConsulting',
        target: '_blank',
        titleSuffix: ' - Consulting YouTube',
        classes: 'text-[var(--color-goc-main-text)] hover:text-[var(--color-goc-light-accent)] transition-colors duration-300 relative group hidden md:flex items-center space-x-1',
        icon: '<i class="fab fa-youtube text-red-500 text-lg"></i>'
    },
];

// This function dynamically generates the navigation links based on the array above.
const generateNav = () => {
    const navContainer = document.getElementById('dynamic-nav');
    if (!navContainer) return;

    // Use a document fragment for better performance on multiple appends.
    const fragment = document.createDocumentFragment();

    navigationLinks.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.className = link.classes;
        if (link.target) {
            a.target = link.target;
        }

        // Add an inner div for spacing if an icon exists
        if (link.icon) {
            a.innerHTML = `
                ${link.icon}
                <span>${link.name}</span>
            `;
        } else {
            a.textContent = link.name;
        }
        
        // Add the animated bottom bar span
        const span = document.createElement('span');
        span.className = 'absolute left-0 bottom-0 w-full h-0.5 bg-[var(--color-goc-light-accent)] origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100';
        a.appendChild(span);

        fragment.appendChild(a);
    });

    navContainer.appendChild(fragment);
};

// This function dynamically sets the page title.
const setPageTitle = () => {
    const currentPath = window.location.pathname;
    
    // Find the link object that matches the current page's URL.
    const currentPageLink = navigationLinks.find(link => {
        return currentPath.includes(link.href.replace('..', ''));
    });
    
    const baseTitle = 'Games Over Coffee';
    const headerTitleSpan = document.getElementById('header-title');

    // If a matching link is found, construct the full title and update the elements.
    if (currentPageLink) {
        const fullTitle = baseTitle + currentPageLink.titleSuffix;
        document.title = fullTitle;
        if (headerTitleSpan) {
            headerTitleSpan.textContent = fullTitle;
        }
    } else {
        // Fallback for pages not in the navigation data.
        document.title = baseTitle;
        if (headerTitleSpan) {
            headerTitleSpan.textContent = baseTitle;
        }
    }
};

// Call both functions when the page loads.
window.addEventListener('DOMContentLoaded', () => {
    generateNav();
    setPageTitle();
});