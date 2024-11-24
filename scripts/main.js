document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadInitialContent();
    initBackgroundEffect();
    const profileImage = document.getElementById('profileImage');
    
    if (profileImage) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const imageRect = profileImage.getBoundingClientRect();
            const imageCenter = imageRect.top + (imageRect.height / 2);
            
            // Calculate opacity based on image position
            const opacity = 5*Math.max(0, Math.min(1, 1 - (scrollPosition / windowHeight)));
            
            profileImage.style.opacity = opacity;
        });
    }
});

function initTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
}

function switchTab(tabId) {
    // Handle blog post URLs
    if (tabId.startsWith('blog/')) {
        const slug = tabId.split('blog/')[1];
        loadBlogPost(slug);
        return;
    }

    // First check if the tab exists
    const targetTab = document.getElementById(tabId);
    if (!targetTab) {
        console.error(`Tab ${tabId} not found`);
        // Fallback to 'about' tab if the requested tab doesn't exist
        tabId = 'about';
    }

    // Remove any existing blog post view
    const blogPost = document.querySelector('.single-blog-post');
    if (blogPost) {
        blogPost.remove();
    }

    // Show all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = '';
    });

    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update content sections
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });

    // Update URL without page reload
    window.history.pushState({tab: tabId}, '', `#${tabId}`);
    
    // Load content if not already loaded
    loadTabContent(tabId);
    
    // Update document title
    updateDocumentTitle(tabId);

    // Show background effect and toggle when not in blog post
    const canvas = document.getElementById('background-canvas');
    const bgToggle = document.getElementById('bg-toggle');
    if (canvas) canvas.style.opacity = localStorage.getItem('bgEffect') === 'off' ? '0' : '1';
    if (bgToggle) bgToggle.style.display = 'block';
}

function initRouting() {
    const path = window.location.pathname;
    
    if (path.startsWith('/blog/')) {
        const slug = path.split('/blog/')[1];
        window.history.replaceState(null, '', `/#blog/${slug}`);
        loadBlogPost(slug);
        return true;
    }
    return false;
}

async function loadBlogPost(slug) {
    const post = blogPosts.find(p => p.slug === slug);
    if (!post) {
        const mainContent = document.querySelector('main');
        mainContent.innerHTML = `
            <div class="content-section">
                <div class="error-message">Blog post not found</div>
                <a href="/#blog" class="read-more">← Back to Blog</a>
            </div>
        `;
        return;
    }

    // Clear any existing blog post container
    const existingPost = document.querySelector('.single-blog-post');
    if (existingPost) {
        existingPost.remove();
    }

    // Show all tab contents but make them inactive
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = '';
        content.classList.remove('active');
    });

    // Deactivate all tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Create blog post container
    const mainContent = document.querySelector('main');
    const blogPostContainer = document.createElement('div');
    blogPostContainer.className = 'single-blog-post active';

    // Hide background effect when showing blog post
    const canvas = document.getElementById('background-canvas');
    const bgToggle = document.getElementById('bg-toggle');
    if (canvas) canvas.style.opacity = '0';
    if (bgToggle) bgToggle.style.display = 'none';

    try {
        const response = await fetch(`/content/blog-posts/${post.file}`);
        if (!response.ok) throw new Error(`Failed to load ${post.file}`);
        const content = await response.text();
        
        const processedContent = post.format === 'markdown' 
            ? markdownParser.parse(content)
            : content;

        blogPostContainer.innerHTML = `
            <div class="content-section blog-reading-mode">
                <a href="/#blog" class="back-link">← Back to Blog</a>
                <article>
                    <h1>${post.title}</h1>
                    <time>${new Date(post.date).toLocaleDateString()}</time>
                    <div class="blog-content">
                        ${processedContent}
                    </div>
                </article>
            </div>
        `;
        
        mainContent.appendChild(blogPostContainer);
        updateDocumentTitle(post.title);

    } catch (error) {
        console.error(`Error loading blog post:`, error);
        blogPostContainer.innerHTML = `
            <div class="content-section">
                <div class="error-message">Failed to load blog post</div>
                <a href="/#blog" class="read-more">← Back to Blog</a>
            </div>
        `;
    }
}

function loadInitialContent() {
    const hash = window.location.hash.slice(1); // Remove the #
    
    if (hash.startsWith('blog/')) {
        const slug = hash.split('blog/')[1];
        loadBlogPost(slug);
        return;
    }
    
    // Handle empty hash or invalid tab
    const validTabs = ['about', 'blog', 'projects'];
    const initialTab = validTabs.includes(hash) ? hash : 'about';
    switchTab(initialTab);
}

async function loadTabContent(tabId) {
    const contentDiv = document.getElementById(tabId);
    
    // Check if the tab exists
    if (!contentDiv) {
        console.error(`Tab content div ${tabId} not found`);
        return;
    }
    
    // Only load if empty
    if (!contentDiv.innerHTML.trim()) {
        try {
            if (tabId === 'blog') {
                // Directly render blog posts
                contentDiv.innerHTML = `
                    <div class="content-section">
                        <h2>Blog Posts</h2>
                        <div class="blog-posts"></div>
                    </div>
                `;
                await renderBlogPosts();
            } else if (tabId === 'projects') {
                // Directly render projects
                contentDiv.innerHTML = `
                    <div class="content-section">
                        <h2>Projects</h2>
                        <div class="projects-grid"></div>
                    </div>
                `;
                renderProjects();
            } else if (tabId === 'about') {
                // Load about page content
                try {
                    const response = await fetch(`/about/index.html`);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const content = await response.text();
                    
                    const temp = document.createElement('div');
                    temp.innerHTML = content;
                    const newContent = temp.querySelector('.content-section');
                    
                    if (newContent) {
                        contentDiv.innerHTML = newContent.outerHTML;
                    } else {
                        throw new Error('Content section not found');
                    }
                } catch (error) {
                    contentDiv.innerHTML = `
                        <div class="content-section">
                            <h2>About</h2>
                            <p>Welcome to my portfolio website.</p>
                        </div>
                    `;
                }
            } else {
                contentDiv.innerHTML = '<div class="content-section"><p>Content not available.</p></div>';
            }
        } catch (error) {
            console.error('Error loading content:', error);
            contentDiv.innerHTML = '<div class="content-section"><p>Error loading content. Please try again.</p></div>';
        }
    }
}

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('blog/')) {
        const slug = hash.split('blog/')[1];
        loadBlogPost(slug);
    } else {
        const validTabs = ['about', 'blog', 'projects'];
        const tab = validTabs.includes(hash) ? hash : 'about';
        switchTab(tab);
    }
});

function updateDocumentTitle(tabId) {
    const capitalizedTab = tabId.charAt(0).toUpperCase() + tabId.slice(1);
    document.title = `Mark Traquair - ${capitalizedTab}`;
}

// Keep your existing render functions
function renderProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = '';
    
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="technologies">
                ${project.technologies.map(tech => 
                    `<span class="tech-tag">${tech}</span>`
                ).join('')}
            </div>
            <a href="${project.link}" class="project-link" target="_blank">View Project →</a>
        `;
        projectsGrid.appendChild(projectCard);
    });
}

// ... (keep your existing blog-related functions) ... 

async function renderBlogPosts() {
    const blogContainer = document.querySelector('.blog-posts');
    if (!blogContainer) return;
    
    blogContainer.innerHTML = '';
    
    try {
        for (const post of blogPosts) {
            const blogPost = document.createElement('article');
            blogPost.className = 'blog-post-preview';

            blogPost.innerHTML = `
                <h3><a href="/#blog/${post.slug}">${post.title}</a></h3>
                <time>${new Date(post.date).toLocaleDateString()}</time>
            `;
            
            blogContainer.appendChild(blogPost);
        }
    } catch (error) {
        console.error(`Error loading blog posts:`, error);
        blogContainer.innerHTML = `
            <div class="error-message">Failed to load blog posts</div>
        `;
    }
}

function initBackgroundEffect() {
    const canvas = document.createElement('canvas');
    canvas.id = 'background-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    
    const toggle = document.createElement('button');
    toggle.id = 'bg-toggle';
    toggle.innerHTML = '🎨';
    toggle.title = 'Toggle Background Effect';
    document.body.appendChild(toggle);

    const effect = new ParticleEffect(canvas);
    
    toggle.addEventListener('click', () => {
        if (canvas.style.opacity === '0') {
            canvas.style.opacity = '1';
            effect.start();
            localStorage.setItem('bgEffect', 'on');
        } else {
            canvas.style.opacity = '0';
            effect.stop();
            localStorage.setItem('bgEffect', 'off');
        }
    });

    // Check user's previous preference
    if (localStorage.getItem('bgEffect') !== 'off') {
        effect.start();
    } else {
        canvas.style.opacity = '0';
    }
}

class ParticleEffect {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.isRunning = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Create initial particles
        for (let i = 0; i < 100; i++) {
            this.particles.push(new Particle(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    stop() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Update particle position based on mouse
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 300) {
                const force = (300 - dist) / 300;
                particle.vx += (dx / dist) * force * 0.5;
                particle.vy += (dy / dist) * force * 0.5;
            }
            
            // Update and draw particle
            particle.update();
            particle.draw(this.ctx);
            
            // Connect nearby particles
            this.particles.forEach(other => {
                const dx = other.x - particle.x;
                const dy = other.y - particle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(100, 100, 255, ${0.2 * (1 - dist / 100)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                }
            });
        });

        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.originalX = x;
        this.originalY = y;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Add friction
        this.vx *= 0.95;
        this.vy *= 0.95;
        
        // Return to original position
        const dx = this.originalX - this.x;
        const dy = this.originalY - this.y;
        this.vx += dx * 0.01;
        this.vy += dy * 0.01;
        
        // Bounce off edges
        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 100, 255, 0.5)';
        ctx.fill();
    }
}

// When displaying blog posts in the preview list
async function displayBlogPosts() {
    const blogContainer = document.querySelector('.blog-posts');
    
    for (const post of blogPosts) {
        const response = await fetch(`/content/blog-posts/${post.file}`);
        const content = await response.text();
        
        let preview;
        if (post.format === 'markdown') {
            preview = markdownParser.getPreview(content, post.previewLength);
        } else {
            // For HTML posts, similar truncation logic
            const textContent = content.replace(/<[^>]+>/g, '');
            preview = textContent.substr(0, post.previewLength).replace(/\s+\S*$/, '') + '...';
        }

        const postElement = document.createElement('div');
        postElement.className = 'blog-post-preview';
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <div class="date">${post.date}</div>
            ${preview}
            <a href="/blog/${post.slug}">Read more...</a>
        `;
        
        blogContainer.appendChild(postElement);
    }
}