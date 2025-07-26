/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  glob: (pattern: string, options?: { eager?: boolean }) => Record<string, any>
}

// VitePress 模块类型定义
interface VitePressModule {
  frontmatter: {
    title?: string
    description?: string
    date?: string
    category?: string
    tags?: string[]
    [key: string]: any
  }
  [key: string]: any
}