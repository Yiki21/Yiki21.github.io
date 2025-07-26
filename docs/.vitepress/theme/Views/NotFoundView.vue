<template>
  <div class="not-found-wrapper">
    <div class="container">
      <div class="not-found-content">
        <!-- 404 图标 -->
        <div class="error-icon">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="m15 9-6 6"/>
            <path d="m9 9 6 6"/>
          </svg>
        </div>

        <!-- 错误信息 -->
        <div class="error-info">
          <h1 class="error-title">404</h1>
          <h2 class="error-subtitle">页面未找到</h2>
          <p class="error-description">
            抱歉，您访问的页面不存在或已被移动。
          </p>
        </div>

        <!-- 操作按钮 -->
        <div class="error-actions">
          <button @click="goHome" class="action-btn primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            返回首页
          </button>
          <button @click="goBack" class="action-btn secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            返回上页
          </button>
        </div>

        <!-- 建议链接 -->
        <div class="suggestions">
          <p class="suggestions-title">您可能想要访问：</p>
          <div class="suggestions-links">
            <a href="/" class="suggestion-link">首页</a>
            <a href="/markdown-examples" class="suggestion-link">Markdown示例</a>
            <a href="/api-examples" class="suggestion-link">API示例</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vitepress'

const router = useRouter()

const goHome = () => {
  router.go('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    router.go('/')
  }
}
</script>

<style lang="scss" scoped>
.not-found-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #1f1f23 0%, #2a2a30 100%);
  color: #e4e4e7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

/* Error Icon */
.error-icon {
  color: #ef4444;
  opacity: 0.8;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 0.8;
    }
    50% {
      opacity: 0.5;
    }
  }
}

/* Error Info */
.error-info {
  text-align: center;
}

.error-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(80px, 12vw, 120px);
  font-weight: 700;
  line-height: 1;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-subtitle {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #f3f4f6;
}

.error-description {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #9ca3af;
  margin: 0;
  max-width: 400px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
}

/* Actions */
.error-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
  }
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  border: none;

  &.primary {
    background: #3b82f6;
    color: white;

    &:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.08);
    color: #e4e4e7;
    border: 1px solid rgba(255, 255, 255, 0.15);

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-1px);
    }
  }

  @media (max-width: 480px) {
    justify-content: center;
    width: 100%;
  }
}

/* Suggestions */
.suggestions {
  text-align: center;
}

.suggestions-title {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #9ca3af;
  margin: 0 0 16px 0;
}

.suggestions-links {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
}

.suggestion-link {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #60a5fa;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.25);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.15);
    color: #93c5fd;
    transform: translateY(-1px);
  }
}
</style>