---
tags: []
title: 配置 Git 同步
slug: git-sync
type: Write
date: 2026-09-27
created_time: 2026-09-27T13:06:09
modify_time: 2026-09-28T00:00:00
authors: dhr2333
status: Published
channels:
  - Beancount-Trans-Docs
published_time: 2026-09-27T13:06:09
content_type: Article
domain: 项目文档
quadrant: 实操教程
Diátaxis: How-to guides
published_url:
  - https://trans.dhr2333.cn/docs/%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97/git-sync
---
**把您的账本授权给平台使用**：账本始终在您手里（在本地、或在您自己的 Git 远程仓库）。平台默认**只读拉取**；您也可以在页面点 **「提交到账本」**，把平台解析并审核后的条目写回仓库（按交易日期归入 `{年}/{月}.bean`），本地 `git pull` 即可取回。

## 托管到平台能得到什么

- **移动端**：通过手机 App（目前仅支持 Android）随时查看账本、做决策前分析或记录条目。下载入口见 [Releases](https://github.com/dhr2333/Beancount-Trans-Mobile/releases)。
- **更贴合语义的分析**：平台的账户目录与标签目录（含中文描述）会作为上下文交给 Copilot，回答中出现的也是您自己的账户与标签。
- **只读分享**：把这份账本以只读方式分享给家人或配偶，也可以交给 AI 客户端：见 [分享账本给他人](https://trans.dhr2333.cn/docs/%E6%95%99%E7%A8%8B/share-ledger) 与 [接入 AI 客户端](https://trans.dhr2333.cn/docs/%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97/connect-ai-client)。

![移动端](https://daihaorui.oss-cn-hangzhou.aliyuncs.com/djangoblog/20260929133904086.jpg)

> **托管也意味着数据放在平台上**：完整的数据流与设计取舍见 [数据流隐私上的设计](https://trans.dhr2333.cn/docs/%E8%A7%A3%E9%87%8A/privacy)；若希望数据完全留在自己的机器上，可参考 [自托管](https://trans.dhr2333.cn/docs/developer/self-host)。

## 您将完成什么

- 在平台上创建或关联一个仓库，并下载 Deploy Key（用于平台拉取账本）
- 把本地账本推送到该仓库，让平台能读到它
- 让平台拉取到最新内容，可以通过 **「Fava」** 中或 **「Copilot」** 中看到自己的账户与交易

## 何时需要这样做

- 账本已经在您自己的 Git 远程仓库里，想在平台上继续看报表、用 Copilot 分析；
- 习惯用编辑器 + Git 管理账本，希望平台也能读到最新内容；

> 如果您还没有账本，可以先按 [快速入门](https://trans.dhr2333.cn/docs/%E6%95%99%E7%A8%8B/quick-start) 上传账单并解析，不必使用 Git 同步。

## 逐步操作

### 选择仓库创建方式

1. 登录平台，悬停右上角用户名，选择 **「个人设置」**；
2. 打开 **「Git 同步」** 标签页，按您的情况选择一种创建方式：

| 方式         | 适合谁                        | 说明                                         |
| :--------- | :------------------------- | :----------------------------------------- |
| **基于模板创建** | 刚开始用 Beancount、想用标准结构      | 平台按标准模板建库，包含目录结构与账户体系，开箱即用                 |
| **空仓库创建**  | **已有账本的用户**（页面标注为「推荐迁移用户」） | 建一个空仓库，等您把现有账本推上来                          |
| **关联已有远程** | 账本已经在自己的 Git 远程仓库上         | 关联您现有的仓库；平台生成的密钥用于**拉取**账本，推送仍使用您自己的 Git 凭据（如需平台「提交到账本」写回，须给该公钥写权限） |

### 自带账本的用户：改造这三处即可

当您选择「空仓库创建」或「关联已有远程」时，需要按下面三条简单改造账本结构：

- **入口文件为根目录下的 `main.bean`**。
- **`main.bean` 里要有 `include "trans/main.bean"`**。
- **`.gitignore` 里要有 `trans/`**。

<details>
<summary>平台推荐的目录结构大致长什么样</summary>

- `main.bean`：主账本入口（包含各条 include）
- `account/`：账户定义
- `20XX_template/` 等：按年份组织的交易记录
- `20XX/00.bean`、`20XX/{01..12}.bean`：**提交到账本**产出的年/月文件（进入 Git）
- `trans/`：**平台管理**的解析产物与写入缓冲（被 `.gitignore` 忽略）

可对照模板仓库 [Beancount-Trans-Assets](https://github.com/dhr2333/Beancount-Trans-Assets)。
</details>

### 下载 Deploy Key 并配置 SSH

1. 在页面点击 **「下载 Deploy Key」**，得到一个 `.pem` 私钥文件；
2. 按页面提示配置 SSH：给密钥设置权限，并把密钥写进 `~/.ssh/config`。

您应看到：

- 密钥文件的权限已收紧为「仅您本人可读」，且 `~/.ssh/config` 中新增了该密钥对应的 Host 配置。

### 克隆仓库到本地

**直接复制页面给出的克隆命令**（形如下面这样）：

```shell
git clone <页面给出的 ssh_clone_url> Assets
```

您应看到：

- 本地多出 `Assets` 目录；若您选择的是「基于模板创建」，该目录中已包含平台生成的目录结构与账户体系。

### 把本地账本放进仓库并推送

1. 把您的账本文件放进刚克隆出来的仓库目录（主文件 `main.bean` 放在**仓库根目录**）；
2. 提交并推送：

```shell
git add .
git commit -m "更新账本"
git push origin main
```

若页面显示的分支名不是 `main`，以页面显示的为准。

### 让平台拉取最新内容

默认由仓库的 **Webhook 自动同步**；也可以回到 **「个人设置 → Git 同步」** 点 **「立即同步」**。

您应看到：

- 打开 **「 Fava」** 能看到您刚推送的账户与交易。

### 把解析结果提交回账本

审核通过后的条目默认只在平台内可见。若要写进你的 Git 仓库：

1. 回到 **「个人设置 → Git 同步」**，点击 **「提交到账本」**；
2. 在弹窗中确认将写入的文件与条数（按交易日期归入 `{年}/{月}.bean`），点 **「提交并推送」**；
3. 本地执行 `git pull` 即可取回。

提交后 `trans/` 中的对应条目会被清空，且无法撤销；请确保条目已在审核阶段处理妥当。

## 常见问题

**Q1：Git 仓库会和平台解析结果冲突吗？**

**A：** 不会。平台默认只拉取；只有你显式点 **「提交到账本」** 时，才会把 `trans/` 中的已审核条目写入 `{年}/{月}.bean` 并推送。`trans/` 本身不进 Git，二者互不干扰。

**Q2：仓库大小有限制吗？**

**A：** 有，具体阈值以平台提示为准，避免提交图片、PDF 等大文件。如果确实有大仓库需求，可以使用「关联已有远程」方式。

## 延伸阅读

- 把这份账本分享给他人：[分享账本给他人](https://trans.dhr2333.cn/docs/%E6%95%99%E7%A8%8B/share-ledger)
- 绑定他人账本后的数据边界：[数据流隐私上的设计](https://trans.dhr2333.cn/docs/%E8%A7%A3%E9%87%8A/privacy)
