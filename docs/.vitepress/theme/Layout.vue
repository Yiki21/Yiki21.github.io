<template>
    <div v-if="frontmatter.home" class="home-layout">
        <Content />
        <Footer />
    </div>

    <!-- 404页面 -->
    <NotFoundView v-else-if="page.isNotFound" />

    <!-- 文章页面布局 -->
    <div v-else class="content-layout">
        <ContentView />
        <Discussion />
        <Footer />
    </div>
</template>

<script lang="ts" setup>
import { useData } from 'vitepress'
import ContentView from './Views/ContentView.vue';
import NotFoundView from './Views/NotFoundView.vue';
import Footer from './Components/Footer.vue';
import Discussion from './Components/Discussion.vue';

const { frontmatter, page } = useData()
</script>

<style lang="scss" scoped>
.home-layout {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.content-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #1f1f23 0%, #2a2a30 100%);
}
</style>