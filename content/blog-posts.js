// Blog post metadata
const blogPosts = [
    {
        title: "Real Post",
        date: "2024-11-23",
        file: "2024-11-23-real-post.html",
        format: 'html',
        slug: 'real-post',
        previewLength: 150
    },
    {
        title: "First Post",
        date: "2024-03-20",
        file: "subdir/2024-03-20-first-post.md",
        format: 'markdown',
        slug: 'first-post',
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
        title: "Project 1",
        description: "A cool project that does something amazing",
        technologies: ["JavaScript", "HTML", "CSS"],
        link: "https://github.com/yourusername/project1"
    }
]; 