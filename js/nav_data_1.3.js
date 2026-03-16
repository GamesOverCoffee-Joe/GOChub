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
        href: 'gocc_1.1.html',
        titleSuffix: ' - Consulting',
        classes: 'text-[var(--color-goc-main-text)] hover:text-[var(--color-goc-light-accent)] transition-colors duration-300 relative group'
    },
    {
        name: 'Lore',
        href: 'lore_1.1.html',
        titleSuffix: ' - Lore',
        classes: 'text-[var(--color-goc-main-text)] hover:text-[var(--color-goc-light-accent)] transition-colors duration-300 relative group'
    },
    {
        name: 'Insights',
        href: 'insights_1.1.html',
        titleSuffix: ' - Insights',
        classes: 'animate-rainbow hover: transition-colors duration-300 relative group'
    },
    {
        name: 'Games Over Coffee',
        href: 'https://www.youtube.com/@GamesOverCoffee',
        target: '_blank',
        titleSuffix: ' - YouTube',
        classes: 'text-[var(--color-goc-main-text)] hover:text-[var(--color-goc-light-accent)] transition-colors duration-300 relative group hidden md:flex items-center space-x-1',
        icon: '<i class="fab fa-youtube text-red-500 text-lg"></i>'
    },
    {
        name: 'Games Over Qualia',
        href: 'https://www.youtube.com/@GamesOverQualia',
        target: '_blank',
        titleSuffix: ' - GOQ YouTube',
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

const setPageTitle = () => {
    const currentPath = window.location.pathname;
    const currentPageLink = navigationLinks.find(link => {
        return currentPath.includes(link.href.replace('..', ''));
    });
    const baseTitle = 'Games Over Coffee';
    const headerTitleSpan = document.getElementById('header-title');
    if (currentPageLink) {
        const fullTitle = baseTitle + currentPageLink.titleSuffix;
        document.title = fullTitle;
        if (headerTitleSpan) {
            headerTitleSpan.textContent = fullTitle;
        }
    } else {
        document.title = baseTitle;
        if (headerTitleSpan) {
            headerTitleSpan.textContent = baseTitle;
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    generateNav();
    setPageTitle();
});
