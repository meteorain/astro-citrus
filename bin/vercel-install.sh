#!/usr/bin/env bash
# Vercel 安装阶段脚本：用 token 拉取私有内容子模块（Vercel 原生不会给私有子模块带凭证），再装依赖。
set -e

echo "CONTENT_DEPLOY_TOKEN length: ${#CONTENT_DEPLOY_TOKEN}"

# 用 token 改写 github.com 的 https 地址，使私有子模块可被拉取
git config --global url."https://x-access-token:${CONTENT_DEPLOY_TOKEN}@github.com/".insteadOf "https://github.com/"

git submodule sync --recursive
git submodule update --init --recursive

echo "src/content file count: $(find src/content -type f | wc -l)"

pnpm install --frozen-lockfile
