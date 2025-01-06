document.addEventListener('DOMContentLoaded', function() {
    // Ensure Prism is available
    if (typeof Prism === 'undefined') {
        console.error('Prism is not loaded');
        return;
    }

    // Process all pre > code blocks
    document.querySelectorAll('pre > code').forEach(codeBlock => {
        const pre = codeBlock.parentElement;
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        // Get the class name which contains language and potentially file path
        const className = codeBlock.className;
        if (className) {
            const match = className.match(/language-(\w+):?(.*)?/);
            if (match) {
                const [, language, filePath] = match;
                
                // Create header if there's a file path
                if (filePath) {
                    const header = document.createElement('div');
                    header.className = 'code-block-header';
                    header.textContent = filePath.trim();
                    wrapper.appendChild(header);
                }
                
                // Update code block class to just language
                codeBlock.className = `language-${language}`;
                pre.className = `language-${language} line-numbers`;
            }
        }
        
        // Move the pre element into the wrapper
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
    });

    // Add copy button to code blocks
    document.querySelectorAll('.code-block-wrapper').forEach(wrapper => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-button';
        copyButton.innerHTML = 'Copy';
        copyButton.addEventListener('click', async () => {
            const code = wrapper.querySelector('code');
            await navigator.clipboard.writeText(code.textContent);
            copyButton.innerHTML = 'Copied!';
            setTimeout(() => {
                copyButton.innerHTML = 'Copy';
            }, 2000);
        });
        wrapper.appendChild(copyButton);
    });

    // Highlight all code blocks
    Prism.highlightAll();
}); 