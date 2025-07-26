<template>
  <div class="content-wrapper">
    <!-- Header -->
    <header class="content-header">
      <div class="container">
        <nav class="breadcrumb">
          <a href="/" class="breadcrumb-item">Home</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ frontmatter.title || 'Article' }}</span>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="content-main">
      <div class="container">
        <article class="article">
          <!-- Article Header -->
          <header class="article-header">
            <div class="article-meta">
              <time class="article-date" :datetime="frontmatter.date">
                {{ formatDate(frontmatter.date) }}
              </time>
            </div>
            <h1 class="article-title">{{ frontmatter.title }}</h1>
            <p v-if="frontmatter.description" class="article-description">
              {{ frontmatter.description }}
            </p>
            <div v-if="frontmatter.tags" class="article-tags">
              <span v-for="tag in frontmatter.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </header>

          <!-- Article Content -->
          <div class="article-content">
            <Content />
          </div>

          <!-- Article Footer -->
          <footer class="article-footer">
            <div class="article-actions">
              <button class="action-btn" @click="scrollToTop">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18,15 12,9 6,15"></polyline>
                </svg>
                Back to top
              </button>
            </div>
          </footer>
        </article>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { Content, useData } from 'vitepress'

const { frontmatter } = useData()

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style lang="scss" scoped>
.content-wrapper {
  min-height: 100vh;
  min-width: 100vb;
  background: linear-gradient(135deg, #1f1f23 0%, #2a2a30 100%);
  color: #e4e4e7;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
}

/* Header */
.content-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(31, 31, 35, 0.85);
}

.breadcrumb {
  display: flex;
  align-items: center;
  padding: 16px 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;

  .breadcrumb-item {
    color: #9ca3af;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: #e4e4e7;
    }
  }

  .breadcrumb-separator {
    margin: 0 12px;
    color: #6b7280;
  }

  .breadcrumb-current {
    color: #e4e4e7;
    font-weight: 500;
  }
}

/* Main Content */
.content-main {
  padding: 40px 0 20px;

  @media (max-width: 768px) {
    padding: 24px 0 60px;
  }
}

.article {
  position: relative;
}

/* Article Header */
.article-header {
  margin-bottom: 48px;
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
}

.article-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #9ca3af;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
}

.article-date,
.article-reading-time {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.article-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 24px 0;
  background: linear-gradient(135deg, #ffffff 0%, #d1d5db 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.article-description {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.6;
  color: #9ca3af;
  margin: 0 0 24px 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 16px;
  }
}

.article-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #60a5fa;
}

/* Article Content */
.article-content {
  font-family: 'Inter', sans-serif;
  line-height: 1.8;
  color: #d1d5db;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    color: #f3f4f6;
    margin: 32px 0 16px 0;
    line-height: 1.3;

    &:first-child {
      margin-top: 0;
    }
  }

  :deep(h1) {
    font-size: 32px;
  }

  :deep(h2) {
    font-size: 24px;
  }

  :deep(h3) {
    font-size: 20px;
  }

  :deep(h4) {
    font-size: 18px;
  }

  :deep(p) {
    margin: 0 0 20px 0;
    font-size: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(a) {
    color: #60a5fa;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s ease;

    &:hover {
      border-bottom-color: #60a5fa;
    }
  }

  :deep(code) {
    font-family: 'JetBrains Mono', monospace;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    padding: 2px 6px;
    font-size: 14px;
    color: #e0e873;
  }

  :deep(pre) {
    background: #1a1a1e;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 24px;
    margin: 24px 0;
    overflow-x: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    line-height: 1.6;

    code {
      background: none;
      border: none;
      padding: 0;
    }
  }

  :deep(pre.shiki) {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    line-height: 1.6;
    background-color: #1a1a1e;
    border-radius: 12px;
    padding: 24px;
  }

  :deep(blockquote) {
    border-left: 4px solid #60a5fa;
    margin: 24px 0;
    padding: 16px 24px;
    background: rgba(59, 130, 246, 0.08);
    border-radius: 0 8px 8px 0;
    color: #9ca3af;
    font-style: italic;

    p {
      margin: 0;
    }
  }

  :deep(ul),
  :deep(ol) {
    margin: 16px 0;
    padding-left: 24px;

    li {
      margin: 8px 0;
      color: #d1d5db;
    }
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.15);

    th,
    td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    th {
      background: rgba(255, 255, 255, 0.08);
      font-weight: 600;
      color: #f3f4f6;
    }

    td {
      color: #d1d5db;
    }

    tr:last-child {

      th,
      td {
        border-bottom: none;
      }
    }
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    margin: 24px 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
}

/* Article Footer */
.article-footer {
  margin-top: 64px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.article-actions {
  display: flex;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  color: #9ca3af;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #e4e4e7;
    transform: translateY(-1px);
  }

  svg {
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: translateY(-1px);
  }
}
</style>