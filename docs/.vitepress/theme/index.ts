import { Theme } from 'vitepress'
import Layout from './Layout.vue'
import ArticlesList from './Components/ArticlesList.vue'
import './assets/base.scss';
import DefaultTheme from 'vitepress/theme'

export default {
    ...DefaultTheme,
    Layout,
    enhanceApp({ app }) {
        app.component('ArticlesList', ArticlesList)
    }
} satisfies Theme