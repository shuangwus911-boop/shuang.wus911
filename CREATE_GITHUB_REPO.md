# 创建 GitHub 仓库指南

## 选项 A: 手动创建 (推荐 - 最快)

1. 访问 https://github.com/new
2. 填写以下信息:
   - **Repository name**: `competitor-monitor`
   - **Description**: `竞争对手监控系统 - Slickdeals 热门商品监控 + AliExpress 自动匹配`
   - **Visibility**: Public (或 Private)
   - **不要**勾选"Add a README file"
   - **不要**勾选".gitignore"
   - **不要**选择 License

3. 点击 "Create repository"

4. 复制仓库 URL (格式：https://github.com/YOUR_USERNAME/competitor-monitor.git)

5. 运行以下命令 (替换 YOUR_USERNAME 为你的 GitHub 用户名):

```bash
git remote add origin https://github.com/YOUR_USERNAME/competitor-monitor.git
git branch -M main
git push -u origin main
```

## 选项 B: 使用 GitHub CLI

如果你已安装 GitHub CLI:

```bash
gh repo create competitor-monitor --public --source=. --remote=origin --push
```

---

创建完成后，请告诉我仓库 URL，我会继续完成后续部署。
