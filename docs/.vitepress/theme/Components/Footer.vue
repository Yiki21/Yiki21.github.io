<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <!-- 个人信息 -->
        <div class="footer-section">
          <h3 class="footer-title">关于我</h3>
          <div class="footer-info">
            <div class="info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Yiki</span>
            </div>
            <div class="info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>北京航空航天大学</span>
            </div>
          </div>
        </div>

        <!-- 联系方式 -->
        <div class="footer-section">
          <h3 class="footer-title">联系我</h3>
          <div class="contact-links">
            <a href="mailto:zy1772696711@gmail.com" class="contact-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>zy1772696711@gmail.com</span>
            </a>
            <a href="mailto:13887325901@163.com" class="contact-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>13887325901@163.com</span>
            </a>
            <a href="https://github.com/Yiki21" target="_blank" rel="noopener noreferrer" class="contact-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <!-- 博客信息 -->
        <div class="footer-section">
          <h3 class="footer-title">博客</h3>
          <div class="blog-info">
            <p>分享编程思考、技术实践和开发经验</p>
            <div class="tech-stack">
              <span class="tech-item">Vue.js</span>
              <span class="tech-item">C++</span>
              <span class="tech-item">Java & Spring & Netty</span>
              <span class="tech-item">Rust</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="footer-bottom">
        <div class="copyright">
          <p>&copy; {{ currentYear }} Yiki's Blog. Built with ❤️ and VitePress.</p>
        </div>
        <div class="footer-links">
          <a href="/rss.xml" class="footer-link">RSS</a>
          <a href="/sitemap.xml" class="footer-link">站点地图</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style lang="scss" scoped>
.footer {
  background: linear-gradient(135deg, #151518 0%, #1a1a1e 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #e4e4e7;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 24px 24px;

  @media (max-width: 768px) {
    padding: 40px 16px 16px;
  }
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
    margin-bottom: 32px;
  }
}

.footer-section {
  .footer-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #f3f4f6;
    margin: 0 0 20px 0;
  }
}

/* 个人信息 */
.footer-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #9ca3af;

  svg {
    color: #60a5fa;
    flex-shrink: 0;
  }
}

/* 联系方式 */
.contact-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #9ca3af;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(96, 165, 250, 0.3);
    color: #60a5fa;
    transform: translateY(-1px);
  }

  svg {
    color: #60a5fa;
    flex-shrink: 0;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: 480px) {
      font-size: 12px;
    }
  }
}

/* 博客信息 */
.blog-info {
  p {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #9ca3af;
    margin: 0 0 16px 0;
  }
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-item {
  padding: 6px 12px;
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.25);
  border-radius: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #60a5fa;
}

/* 底部版权 */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}

.copyright {
  p {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
}

.footer-links {
  display: flex;
  gap: 24px;

  @media (max-width: 768px) {
    gap: 16px;
  }
}

.footer-link {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #60a5fa;
  }
}
</style>