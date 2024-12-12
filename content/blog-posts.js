// Blog post metadata
const blogPosts = [
    {
        title: "Encapsulating Java classes in Python (Runelite series pt.2)",
        date: "2024-12-12",
        file: "runelite-post2.html",
        format: 'html',
        slug: 'runelite-post2',
        previewLength: 150
    },
    {
        title: "Py4j - Java -> Python Runelite Plugin (Runelite series pt.1)",
        date: "2024-11-25",
        file: "runelite-post1.html",
        format: 'html',
        slug: 'runelite-post1',
        previewLength: 150
    }
];

// Keep markdown parser for processing .md files
const markdownParser = {
    parse(md, previewLength = null) {
        // Handle paragraphs first (empty lines between paragraphs)
        let html = md.split(/\n\n+/).map(block => {
            // Process images and links first
            block = block
                .replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">')
                .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');

            // Check if block is a list
            if (block.match(/^\s*[\-\*]\s/m)) {
                return '<ul>' + block
                    .split(/\n/)
                    .map(item => item.replace(/^\s*[\-\*]\s(.*)$/, '<li>$1</li>'))
                    .join('') + '</ul>';
            }
            
            // Process block-level elements
            return block
                .replace(/^#{3}\s+(.*?)$/gm, '<h3>$1</h3>')
                .replace(/^#{2}\s+(.*?)$/gm, '<h2>$1</h2>')
                .replace(/^#{1}\s+(.*?)$/gm, '<h1>$1</h1>')
                .replace(/^(?!<[a-z])/gm, '<p>$&</p>');
        }).join('\n');

        // Process remaining inline elements
        html = html
            .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>');

        // If preview length is specified, truncate the content
        if (previewLength) {
            // Strip HTML tags for text counting
            const textContent = html.replace(/<[^>]+>/g, '');
            if (textContent.length > previewLength) {
                // Truncate at word boundary
                const truncated = textContent.substr(0, previewLength).replace(/\s+\S*$/, '');
                return `<div class="preview">${truncated}...</div>`;
            }
        }

        return html;
    },

    // Helper method to get just the preview
    getPreview(md, length) {
        return this.parse(md, length);
    }
};

const projects = [
    {
        title: "Runelite - Py4j bindings (WIP)",
        description: "Plugin + bindings to collect and interact with live data from a Runelite instance (open-source client for MMORPG RuneScape)<br>Java -> Python<br><br>Blog post coming soon",
        technologies: ["Python", "Java", "Py4j"],
        link: "https://github.com/MarkProjectRepo/runelite",
        image: "/assets/runelite.png"
    },
    {
        title: "Meal Planner",
        description: "Quick 2 hour project with Cursor to automate meal planning using Ollama",
        technologies: ["Python", "Ollama", "LLMs", "FastHTML"],
        link: "https://github.com/MarkProjectRepo/meal_planner",
        image: "/assets/meal_planner.png"
    }
]; 