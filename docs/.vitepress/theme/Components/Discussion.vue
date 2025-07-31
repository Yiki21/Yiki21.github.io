<template>
    <div class="giscus-container">
        <Giscus :key="page.filePath" repo="Yiki21/Yiki21.github.io" repo-id="R_kgDOPTIcjQ" category="Announcements"
            category-id="DIC_kwDOPTIcjc4CtcE_" mapping="pathname" strict="0" reactions-enabled="0" emit-metadata="0"
            input-position="bottom" lang="zh-CN" crossorigin="anonymous" theme="dark" />
    </div>
</template>

<script lang="ts" setup>
import { useData } from 'vitepress'
import Giscus from "@giscus/vue";

const { page } = useData()
</script>

<style lang="scss" scoped>
.giscus-container {
    width: 60%;
    margin: 0 auto;
    padding: 0 24px;
    margin-top: 40px;
    margin-bottom: 32px;

    @media (max-width: 768px) {
        padding: 0 16px;
        margin-top: 48px;
        margin-bottom: 24px;
        width: 90%;
    }

    // 添加评论区标题
    &::before {
        content: "💬 评论区";
        display: block;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 20px;
        font-weight: 600;
        color: #f3f4f6;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        text-align: center;
    }
}
</style>

<!-- 全局样式用于自定义 Giscus 主题 -->
<style lang="scss">
// Giscus 主题自定义 - 现代简约暗色主题
main {
    // 基础颜色 - 更现代的背景
    --color-canvas-default: #0f0f11;
    --color-canvas-subtle: #1a1a1e;
    --color-canvas-inset: #161618;
    --color-border-default: rgba(255, 255, 255, 0.12);
    --color-border-muted: rgba(255, 255, 255, 0.06);

    // 文字颜色 - 更柔和的对比
    --color-fg-default: #e8e8ea;
    --color-fg-muted: #a8a8aa;
    --color-fg-subtle: #707072;
    --color-fg-on-emphasis: #ffffff;

    // 现代化的强调色
    --color-accent-fg: #60a5fa;
    --color-accent-emphasis: #3b82f6;
    --color-accent-muted: rgba(96, 165, 250, 0.4);
    --color-accent-subtle: rgba(96, 165, 250, 0.15);

    // 现代按钮样式 - 圆角和渐变
    --color-btn-bg: rgba(255, 255, 255, 0.08);
    --color-btn-border: rgba(255, 255, 255, 0.12);
    --color-btn-text: #e8e8ea;
    --color-btn-hover-bg: rgba(255, 255, 255, 0.12);
    --color-btn-hover-border: rgba(255, 255, 255, 0.2);
    --color-btn-active-bg: rgba(255, 255, 255, 0.16);
    --color-btn-selected-bg: rgba(96, 165, 250, 0.2);

    // 主要按钮 - 现代渐变效果
    --color-btn-primary-bg: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    --color-btn-primary-border: #60a5fa;
    --color-btn-primary-text: #ffffff;
    --color-btn-primary-hover-bg: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    --color-btn-primary-hover-border: #3b82f6;
    --color-btn-primary-selected-bg: #2563eb;
    --color-btn-primary-selected-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);

    // 现代输入框样式
    --color-input-bg: rgba(255, 255, 255, 0.04);
    --color-input-border: rgba(255, 255, 255, 0.12);
    --color-input-shadow: 0 0 0 0 transparent;
    --color-input-focus-border: #60a5fa;
    --color-input-focus-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
    --color-input-contrast-bg: #0f0f11;
    --color-input-disabled-bg: rgba(255, 255, 255, 0.02);

    // 现代化语法高亮 - Catppuccin Mocha 风格
    --color-prettylights-syntax-comment: #6c7086;
    --color-prettylights-syntax-constant: #89b4fa;
    --color-prettylights-syntax-entity: #cba6f7;
    --color-prettylights-syntax-storage-modifier-import: #cdd6f4;
    --color-prettylights-syntax-entity-tag: #a6e3a1;
    --color-prettylights-syntax-keyword: #f38ba8;
    --color-prettylights-syntax-string: #a6e3a1;
    --color-prettylights-syntax-variable: #fab387;
    --color-prettylights-syntax-brackethighlighter-unmatched: #f38ba8;
    --color-prettylights-syntax-invalid-illegal-text: #f38ba8;
    --color-prettylights-syntax-invalid-illegal-bg: #45141d;
    --color-prettylights-syntax-carriage-return-text: #f38ba8;
    --color-prettylights-syntax-carriage-return-bg: #45141d;
    --color-prettylights-syntax-string-regexp: #a6e3a1;
    --color-prettylights-syntax-markup-list: #f9e2af;
    --color-prettylights-syntax-markup-heading: #89b4fa;
    --color-prettylights-syntax-markup-italic: #cdd6f4;
    --color-prettylights-syntax-markup-bold: #cdd6f4;
    --color-prettylights-syntax-markup-deleted-text: #f38ba8;
    --color-prettylights-syntax-markup-deleted-bg: #45141d;
    --color-prettylights-syntax-markup-inserted-text: #a6e3a1;
    --color-prettylights-syntax-markup-inserted-bg: #1a3a1a;
    --color-prettylights-syntax-markup-changed-text: #fab387;
    --color-prettylights-syntax-markup-changed-bg: #3d2817;

    // 现代代码块样式
    --color-markdown-code-bg: rgba(255, 255, 255, 0.06);
    --color-markdown-blockquote-border: #60a5fa;

    // 现代反应表情样式
    --color-social-reaction-bg-hover: rgba(96, 165, 250, 0.12);
    --color-social-reaction-bg-reacted-hover: rgba(96, 165, 250, 0.2);

    // 现代阴影和深度
    --color-shadow-small: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    --color-shadow-medium: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2);
    --color-shadow-large: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.2);
}

// Giscus 现代化样式优化
.giscus {
    // 整体容器样式
    background: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
    
    iframe {
        border-radius: 16px !important;
        background: transparent !important;
        border: none !important;
        
        // 现代阴影效果
        box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        
        @media (max-width: 768px) {
            border-radius: 12px !important;
        }
    }
}

// 深度自定义 Giscus 内部样式
.giscus-frame {
    border: none !important;
    background: transparent !important;
    
    // 按钮圆角
    button {
        border-radius: 8px !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        
        &:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(96, 165, 250, 0.3) !important;
        }
    }
    
    // 输入框现代化
    textarea, input {
        border-radius: 12px !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        
        &:focus {
            transform: scale(1.02) !important;
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2) !important;
        }
    }
    
    // 评论卡片样式
    .gsc-comment {
        border-radius: 12px !important;
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        margin-bottom: 16px !important;
        
        &:hover {
            background: rgba(255, 255, 255, 0.06) !important;
            border-color: rgba(255, 255, 255, 0.12) !important;
        }
    }
    
    // 头像圆角
    .gsc-comment-author-avatar img {
        border-radius: 50% !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
    }
    
    // 代码块现代化
    pre, code {
        border-radius: 8px !important;
        background: rgba(255, 255, 255, 0.06) !important;
    }
}

// 响应式优化
@media (max-width: 768px) {
    .giscus {
        border-radius: 12px;
        margin: 0 8px;
    }
}
</style>