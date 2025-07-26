<template>
  <div class="articles-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ frontmatter.title || '技术博客' }}</h1>
        <p class="hero-description">{{ frontmatter.description || '分享编程思考与技术实践' }}</p>
        <div class="hero-stats">
          <span class="stat-item">{{ totalArticles }} 篇文章</span>
          <span class="stat-item">{{ categories.length }} 个分类</span>
        </div>
      </div>
    </section>

    <!-- Categories Filter -->
    <section class="categories-section">
      <div class="categories-header">
        <h2>文章分类</h2>
      </div>
      <div class="categories-grid">
        <button 
          class="category-card" 
          :class="{ active: selectedCategory === 'all' }"
          @click="selectedCategory = 'all'"
        >
          <div class="category-icon">📚</div>
          <div class="category-info">
            <h3>全部文章</h3>
            <span class="category-count">{{ totalArticles }}</span>
          </div>
        </button>
        
        <button 
          v-for="category in categories" 
          :key="category.name"
          class="category-card"
          :class="{ active: selectedCategory === category.name }"
          @click="selectedCategory = category.name"
        >
          <div class="category-icon">{{ category.icon }}</div>
          <div class="category-info">
            <h3>{{ category.name }}</h3>
            <span class="category-count">{{ category.count }}</span>
          </div>
        </button>
      </div>
    </section>

    <!-- Articles List -->
    <section class="articles-section">
      <div class="articles-header">
        <h2>
          {{ selectedCategory === 'all' ? '全部文章' : selectedCategory }}
          <span class="articles-count">({{ filteredArticles.length }})</span>
        </h2>
      </div>
      
      <div class="articles-grid">
        <article 
          v-for="article in filteredArticles" 
          :key="article.url"
          class="article-card"
        >
          <div class="article-content">
            <div class="article-meta">
              <time class="article-date">{{ formatDate(article.date) }}</time>
              <span v-if="article.category" class="article-category">{{ article.category }}</span>
            </div>
            
            <h3 class="article-title">
              <a :href="article.url">{{ article.title }}</a>
            </h3>
            
            <p v-if="article.description" class="article-description">
              {{ article.description }}
            </p>
            
            <div v-if="article.tags" class="article-tags">
              <span v-for="tag in article.tags.slice(0, 3)" :key="tag" class="tag">
                {{ tag }}
              </span>
              <span v-if="article.tags.length > 3" class="tag-more">
                +{{ article.tags.length - 3 }}
              </span>
            </div>
          </div>
          
          <div class="article-actions">
            <a :href="article.url" class="read-more">
              阅读全文
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </a>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

// 定义文章类型
interface Article {
  url: string
  title: string
  description: string
  date: string
  category: string
  tags: string[]
}

// 定义模块类型
interface ModuleType {
  frontmatter?: {
    title?: string
    description?: string
    date?: string
    category?: string
    tags?: string[]
    [key: string]: any
  }
  [key: string]: any
}

// 使用 import.meta.glob 动态导入所有 markdown 文件
const modules = import.meta.glob('/*.md', { eager: true }) as Record<string, ModuleType>

console.log('导入的文章模块:', modules)

// 处理导入的模块，提取文章信息
const articles = ref<Article[]>(
  Object.entries(modules).map(([path, mod]) => {
    const url = path.replace('/blogs/', '/').replace('.md', '.html')
    const { __pageData : pageData } = mod
    const { frontmatter } = pageData || {}

    return {
      url,
      title: frontmatter.title || pageData.title || '无标题',
      description: frontmatter.description || pageData.description || '',
      date: frontmatter.date || pageData.date || new Date().toISOString().split('T')[0],
      category: frontmatter.category || pageData.category || '未分类',
      tags: frontmatter.tags || pageData.tags || []
    }
  })
  // 按日期倒序排列
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  // 过滤掉首页
  .filter(article => !article.url.includes('/index.html'))
)

const selectedCategory = ref<string>('all')

// 定义分类类型
interface Category {
  name: string
  count: number
  icon: string
}

// 计算分类信息
const categories = computed<Category[]>(() => {
  const categoryMap = new Map<string, number>()
  
  articles.value.forEach(article => {
    if (article.category && article.category !== '未分类') {
      const count = categoryMap.get(article.category) || 0
      categoryMap.set(article.category, count + 1)
    }
  })
  
  const categoryIcons: Record<string, string> = {
    '编程思考': '💭',
    '前端开发': '🎨',
    '编程语言': '⚡',
    '系统设计': '🏗️',
    '开发工具': '🔧',
    '读书笔记': '📖',
    '未分类': '📝'
  }
  
  return Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    count,
    icon: categoryIcons[name] || '📝'
  }))
})

const totalArticles = computed(() => articles.value.length)

const filteredArticles = computed(() => {
  if (selectedCategory.value === 'all') {
    return articles.value
  }
  return articles.value.filter(article => article.category === selectedCategory.value)
})

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style lang="scss" scoped>
.articles-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1f1f23 0%, #2a2a30 100%);
  color: #e4e4e7;
}

/* Hero Section */
.hero-section {
  padding: 80px 24px 60px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 60px 16px 40px;
  }
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(36px, 6vw, 56px);
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 24px 0;
  background: linear-gradient(135deg, #ffffff 0%, #d1d5db 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.6;
  color: #9ca3af;
  margin: 0 0 32px 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  
  @media (max-width: 768px) {
    gap: 24px;
  }
}

.stat-item {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #60a5fa;
  padding: 8px 16px;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.2);
  border-radius: 20px;
}

/* Categories Section */
.categories-section {
  padding: 0 24px 60px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 0 16px 40px;
  }
}

.categories-header {
  margin-bottom: 32px;
  
  h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #f3f4f6;
    margin: 0;
  }
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  &.active {
    background: rgba(96, 165, 250, 0.15);
    border-color: rgba(96, 165, 250, 0.3);
  }
}

.category-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.category-info {
  h3 {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #f3f4f6;
    margin: 0 0 4px 0;
  }
}

.category-count {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #9ca3af;
}

/* Articles Section */
.articles-section {
  padding: 0 24px 80px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 0 16px 60px;
  }
}

.articles-header {
  margin-bottom: 32px;
  
  h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #f3f4f6;
    margin: 0;
  }
}

.articles-count {
  color: #9ca3af;
  font-weight: 400;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.article-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-4px);
  }
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.article-date {
  color: #9ca3af;
}

.article-category {
  padding: 4px 8px;
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.25);
  border-radius: 12px;
  color: #60a5fa;
  font-weight: 500;
}

.article-title {
  margin: 0 0 12px 0;
  
  a {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #f3f4f6;
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: #60a5fa;
    }
  }
}

.article-description {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #9ca3af;
  margin: 0 0 16px 0;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #d1d5db;
}

.tag-more {
  @extend .tag;
  color: #9ca3af;
}

.article-actions {
  display: flex;
  justify-content: flex-end;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.25);
  border-radius: 20px;
  color: #60a5fa;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(96, 165, 250, 0.25);
    transform: translateX(2px);
  }
  
  svg {
    transition: transform 0.2s ease;
  }
  
  &:hover svg {
    transform: translateX(2px);
  }
}
</style>