import { defineConfig } from "vitepress";

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
    head: [
        [
            'link',
            { rel: "preconnect", href: "https://fonts.googleapis.com" },
        ],
        [
            'link',
            { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        ],
        [
            'link',
            { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" },
        ],
        [
            'link',
            { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" },
        ],
        [
            'link',
            { rel: "stylesheet", href: "https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,501&display=swap" },
        ],
        [
            'link',
            { rel: 'stylesheet', href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" },
        ],
    ],
    description: 'A blog about web development, programming, and what I learn.',
    srcDir: './blogs',

    vite: {
        resolve: {
            alias: {
                '@': '/docs/.vitepress/theme',
                '@blogs': '/docs/blogs'
            }
        }
    },

    markdown: {
        theme: {
            light: 'catppuccin-mocha',
            dark: 'catppuccin-mocha',
        },
    },
})