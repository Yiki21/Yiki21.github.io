import { defineConfig } from "vitepress";
import fg from "fast-glob";
import matter from "gray-matter";
import { Feed } from "feed";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://yiki21.github.io";
const BLOG_SOURCE_DIR = join(__dirname, "../blogs");
const AUTHOR_NAME = "Yiki";

function stripMarkdown(text: string): string {
    return text
        .replace(/`{3}[\s\S]*?`{3}/g, "")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
        .replace(/\{\{(.*?)\}\}/g, "")
        .replace(/[*_>#-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

async function generateRSS(outDir: string) {
    const feed = new Feed({
        title: "Yiki's Blogs",
        description: "Latest posts from Yiki's Blog",
        id: SITE_URL,
        link: SITE_URL,
        language: "zh-CN",
        updated: new Date(),
        copyright: `© ${new Date().getFullYear()} ${AUTHOR_NAME}`,
        feedLinks: {
            rss2: `${SITE_URL}/rss.xml`,
        },
        author: {
            name: AUTHOR_NAME,
            link: SITE_URL,
        },
    });

    const files = await fg(["**/*.md", "!index.md", "!**/index.md", "!assets/**"], {
        cwd: BLOG_SOURCE_DIR,
    });

    const entries: Array<{
        url: string;
        title: string;
        description: string;
        date: Date;
    }> = [];

    for (const file of files) {
        const fullPath = join(BLOG_SOURCE_DIR, file);
        const raw = readFileSync(fullPath, "utf-8");
        const { data, content } = matter(raw);

        if (data?.draft === true) continue;

        const route = file.replace(/\.md$/, ".html");
        const url = new URL(route, SITE_URL).toString();
        const title = data?.title ?? route;
        const description = data?.description ?? stripMarkdown(content).slice(0, 280);
        const published = data?.date ? new Date(data.date) : new Date();

        entries.push({ url, title, description, date: published });
    }

    entries
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .forEach(({ url, title, description, date }) => {
            feed.addItem({
                id: url,
                link: url,
                title,
                description,
                date,
                author: [
                    {
                        name: AUTHOR_NAME,
                        link: SITE_URL,
                    },
                ],
            });
        });

    const rssOutputPath = join(outDir, "rss.xml");
    writeFileSync(rssOutputPath, feed.rss2(), "utf-8");
}

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
        [
            'link',
            { rel : 'icon', href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🗿</text></svg>" }
        ],
        [
            'link',
            { rel: 'alternate', type: 'application/rss+xml', title: "Yiki's Blogs RSS", href: '/rss.xml' },
        ],
    ],
    
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

    async buildEnd(siteConfig) {
        const outDir = siteConfig.outDir ?? join(__dirname, "dist");
        await generateRSS(outDir);
    },
})