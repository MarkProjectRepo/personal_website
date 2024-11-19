// Add loading state functionality
function setLoading(isLoading) {
    const content = document.querySelector('main');
    if (isLoading) {
        content.style.opacity = '0.5';
        content.style.pointerEvents = 'none';
    } else {
        content.style.opacity = '1';
        content.style.pointerEvents = 'auto';
    }
}

// Simulate dynamic content loading
async function loadContent(tabId) {
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update active states
    document.querySelectorAll('.tab-button').forEach(btn => 
        btn.classList.toggle('active', btn.dataset.tab === tabId)
    );
    document.querySelectorAll('.tab-content').forEach(content => 
        content.classList.toggle('active', content.id === tabId)
    );
    
    setLoading(false);
}

// Update tab switching functionality
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        loadContent(button.dataset.tab);
    });
});

// Add intersection observer for animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, { threshold: 0.1 });

// Render projects with animation
function renderProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    projectsGrid.innerHTML = ''; // Clear existing content
    
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <p class="technologies">
                ${project.technologies.map(tech => 
                    `<span class="tech-tag">${tech}</span>`
                ).join('')}
            </p>
            <a href="${project.link}" target="_blank" class="project-link">View Project →</a>
        `;
        projectsGrid.appendChild(projectCard);
        observer.observe(projectCard);
    });
}

// Render blog posts with animation
function renderBlogPosts() {
    const blogContainer = document.querySelector('.blog-posts');
    blogContainer.innerHTML = ''; // Clear existing content
    
    blogPosts.forEach(post => {
        const blogPost = document.createElement('article');
        blogPost.className = 'blog-post';
        blogPost.innerHTML = `
            <h3>${post.title}</h3>
            <time>${new Date(post.date).toLocaleDateString()}</time>
            <p>${post.content}</p>
            <button class="read-more">Read More →</button>
        `;
        blogContainer.appendChild(blogPost);
        observer.observe(blogPost);
    });
}

// Initialize content
renderProjects();
renderBlogPosts();

// Add scroll-to-top button
const scrollButton = document.createElement('button');
scrollButton.className = 'scroll-top';
scrollButton.innerHTML = '↑';
document.body.appendChild(scrollButton);

scrollButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
    scrollButton.classList.toggle('visible', window.scrollY > 300);
});

// Replace the existing particle code with this new implementation
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.friction = 0.97;
        this.gravity = 0;
        this.mouseStrength = 0.15;
        this.mouseRadius = 150;
    }

    update(mouseX, mouseY) {
        // Verlet integration
        const velocityX = (this.x - this.oldX) * this.friction;
        const velocityY = (this.y - this.oldY) * this.friction;

        // Save current position
        this.oldX = this.x;
        this.oldY = this.y;

        // Mouse attraction
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.mouseRadius) {
            const force = (1 - distance / this.mouseRadius) * this.mouseStrength;
            this.x += dx * force;
            this.y += dy * force;
        }

        // Update position
        this.x += velocityX;
        this.y += velocityY + this.gravity;

        // Screen wrapping
        if (this.x < 0) this.x = window.innerWidth;
        if (this.x > window.innerWidth) this.x = 0;
        if (this.y < 0) this.y = window.innerHeight;
        if (this.y > window.innerHeight) this.y = 0;
        
        // Update old position when wrapping to prevent elastic effect
        if (Math.abs(this.x - this.oldX) > window.innerWidth/2) {
            this.oldX = this.x;
        }
        if (Math.abs(this.y - this.oldY) > window.innerHeight/2) {
            this.oldY = this.y;
        }
    }
}

const particleSystem = {
    particles: [],
    mouseX: 0,
    mouseY: 0,
    container: null,
    count: 50,

    init() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'particles';
        document.body.appendChild(this.container);

        // Create particles
        for (let i = 0; i < this.count; i++) {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            this.particles.push(new Particle(x, y));
            
            const element = document.createElement('div');
            element.className = 'particle';
            this.container.appendChild(element);
        }

        // Mouse move handler
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Start animation
        this.animate();
    },

    animate() {
        // Update particles
        this.particles.forEach((particle, index) => {
            particle.update(this.mouseX, this.mouseY);
            
            // Update DOM element position
            const element = this.container.children[index];
            element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
        });

        requestAnimationFrame(() => this.animate());
    }
};

// Update particle styles
const particleStyles = `
.particles {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
}

.particle {
    position: absolute;
    width: 3px;
    height: 3px;
    background: var(--secondary-color);
    border-radius: 50%;
    box-shadow: 0 0 10px var(--secondary-color);
    transition: transform 0.05s linear;
    opacity: 0.6;
}
`;

// Update initialization
document.addEventListener('DOMContentLoaded', () => {
    // Replace particlesConfig.init() with:
    particleSystem.init();
    
    initTiltEffect();
    initMagneticButtons();
    
    // Add particle styles
    const style = document.createElement('style');
    style.textContent = particleStyles;
    document.head.appendChild(style);
});

// Add 3D tilt effect to project cards
function initTiltEffect() {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale3d(1.05, 1.05, 1.05)
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// Smooth scroll effect
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add magnetic effect to buttons
function initMagneticButtons() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });
}

// Enhanced content loading with animations
async function loadContent(tabId) {
    const content = document.getElementById(tabId);
    
    // Fancy exit animation
    document.querySelectorAll('.tab-content.active').forEach(activeContent => {
        activeContent.style.transform = 'scale(0.8)';
        activeContent.style.opacity = '0';
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update active states
    document.querySelectorAll('.tab-button').forEach(btn => 
        btn.classList.toggle('active', btn.dataset.tab === tabId)
    );
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.transform = '';
        content.style.opacity = '';
    });
    
    // Fancy entrance animation
    content.classList.add('active');
    content.style.transform = 'scale(0.8)';
    content.style.opacity = '0';
    
    requestAnimationFrame(() => {
        content.style.transform = 'scale(1)';
        content.style.opacity = '1';
    });
} 