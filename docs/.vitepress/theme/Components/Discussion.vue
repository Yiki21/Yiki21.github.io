<template>
    <div class="giscus-container">
        <Giscus :key="page.filePath" repo="Yiki21/Yiki21.github.io" repo-id="R_kgDOPTIcjQ" category="Announcements"
            category-id="DIC_kwDOPTIcjc4CtcE_" mapping="pathname" strict="0" reactions-enabled="0" emit-metadata="0"
            input-position="bottom" theme="catppuccin_mocha" lang="zh-CN" crossorigin="anonymous" />
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
    }

    // Giscus 样式自定义
    :deep(.giscus) {
        .giscus-frame {
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(20px);
            overflow: hidden;
        }
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

<!-- 全局样式用于自定义 Giscus iframe 内容 -->
<style lang="scss">
// 由于 Giscus 使用 iframe，我们需要通过 CSS 变量来自定义样式
:root {
    --giscus-primary: #60a5fa;
    --giscus-primary-hover: #3b82f6;
    --giscus-bg: #1a1a1e;
    --giscus-bg-secondary: rgba(255, 255, 255, 0.08);
    --giscus-border: rgba(255, 255, 255, 0.15);
    --giscus-text: #e4e4e7;
    --giscus-text-secondary: #9ca3af;
    --giscus-border-radius: 8px;
}

// Giscus 容器额外样式
.giscus {
    iframe {
        border-radius: 12px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
    }
}
</style>