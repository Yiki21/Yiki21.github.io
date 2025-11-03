---
title: "使用 Shell Startup File 和 systemd environment.d 设置 LSP 的 GitHub Token"
description: "解决 LSP 频繁遇到 API rate limit exceeded 问题的完整指南"
date: "2025-11-02"
category: "Tips"
tags: ["LSP", "IDE", "Shell", "systemd", "GitHub"]
---

## 问题背景

在使用现代 IDE 和编辑器（如 VSCode、Neovim、Zed）时，许多 Language Server Protocol (LSP) 服务需要访问 GitHub API 来获取依赖信息、类型定义或文档。常见的例子包括：

- **rust-analyzer**: 获取 crates.io 的依赖元数据
- **TypeScript/JavaScript LSP**: 下载 DefinitelyTyped 类型定义
- **Python LSP (pyright)**: 查询包的类型信息

### 为什么会遇到 Rate Limit？

GitHub API 对**未认证请求**有严格的速率限制：
- 未认证：每小时 **60 次**请求
- 已认证：每小时 **5000 次**请求

当 LSP 频繁查询依赖信息时，很容易触发限制，导致以下错误：

```
API rate limit exceeded for xxx.xxx.xxx.xxx
```

这会导致代码补全、类型检查等功能失效。

## 解决方案

### 方法一：Shell 启动脚本（适用于终端启动的 IDE）

如果你从终端启动 IDE，可以在 shell 启动脚本中设置环境变量：

**1. 编辑对应的启动脚本：**
- Bash: `~/.bashrc`
- Zsh: `~/.zshrc`
- Fish: `~/.config/fish/config.fish`
- Hyprland: `~/.config/hypr/hyprland.conf`

**2. 添加以下内容：**

```bash
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxx"
```

**3. 重新加载配置：**

```bash
source ~/.zshrc  # 或对应的配置文件
```

**4. 重启 IDE**，确保它能继承新的环境变量。

### 方法二：systemd environment.d（适用于图形界面启动的应用）

⚙️ **重要**：如果你在 Wayland/X11 桌面环境中直接点击图标启动 IDE（如 VSCode、Zed），这些应用**不会继承**你在 shell 中设置的环境变量。

对于使用 systemd 的发行版（Fedora、Arch、Ubuntu 等），需要使用 systemd 的用户环境变量机制：

**1. 创建配置文件：**

```bash
mkdir -p ~/.config/environment.d
```

**2. 编辑或创建 `~/.config/environment.d/99-github.conf`：**

```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxx
```

> **注意**：此文件使用简单的 `KEY=VALUE` 格式，**不需要** `export` 关键字。

**3. 导入环境变量到当前会话：**

```bash
systemctl --user import-environment GITHUB_TOKEN
```

**4. 重启图形会话或重启 IDE**。

如果还不生效，可以**注销并重新登录**，或重启 `systemd --user` 管理的服务。

## 如何获取 GitHub Token？

1. 访问 [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. 点击 **Generate new token** → **Generate new token (classic)**
3. 给 token 命名（如 `LSP Access`）
4. **不需要勾选任何权限**（只读公共 API 即可）
5. 生成后**立即保存**（只显示一次）

## 验证配置

你可以在终端中验证环境变量是否设置成功：

```bash
echo $GITHUB_TOKEN
```

或者检查 IDE 进程的环境变量：

```bash
# 查找 VSCode 进程 ID
ps aux | grep -i code

# 查看进程的环境变量（替换 <PID> 为实际进程 ID）
cat /proc/<PID>/environ | tr '\0' '\n' | grep GITHUB_TOKEN
```

## 注意事项

1. **不同的 LSP 可能使用不同的环境变量名**，常见的包括：
   - `GITHUB_TOKEN`
   - `GH_TOKEN`
   - `GITHUB_API_TOKEN`
   
   如果遇到问题，查看对应 LSP 的文档。

2. **Token 安全**：
   - 不要将 token 提交到 Git 仓库
   - 定期轮换 token
   - 使用最小权限原则（LSP 只需公共读取权限）

3. **桌面环境差异**：
   - GNOME/KDE：通常会读取 `~/.config/environment.d/`
   - i3/sway：可能需要在 `~/.xinitrc` 或 `~/.config/sway/config` 中设置
   - macOS：使用 `launchctl setenv` 或 `/etc/launchd.conf`

## 总结

通过正确设置 `GITHUB_TOKEN` 环境变量，可以将 GitHub API 的速率限制从 60/小时提升到 5000/小时，彻底解决 LSP 的 rate limit 问题。根据你的使用场景（终端启动 vs 图形界面启动），选择合适的配置方法即可。
