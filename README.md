# Beancount-Trans 文档

[Beancount-Trans](https://github.com/dhr2333/Beancount-Trans) 项目的文档站点，使用 Docusaurus 构建。

## 在线访问

📖 **文档已部署在线访问**: [https://trans.dhr2333.cn/docs/](https://trans.dhr2333.cn/docs/)

## 项目概述

此仓库是 Beancount-Trans 项目的子项目，专门负责提供项目的完整文档支持，包括使用指南、API 参考、开发教程和最佳实践等内容。

## 本地开发

### 前置要求

- Node.js 16.14 或更高版本
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

此命令会启动本地开发服务器并打开浏览器窗口。大多数更改会实时热重载。

### 构建静态站点

```bash
npm run build
```

此命令将静态内容生成到 `build` 目录中，可以服务于任何静态内容托管服务。

## 项目结构

```shell
.
├── docs                 # 文档源文件
│   ├── getting-started  # 入门指南
│   ├── guides           # 使用指南
│   └── api              # API 参考
├── src
│   ├── components       # React 组件
│   ├── css              # 自定义样式
│   └── pages            # 额外页面
├── static               # 静态资源
│   └── img              # 图片资源
└── docusaurus.config.ts # 站点配置
```

## 贡献指南

我们欢迎对 Beancount-Trans 文档的贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

请确保您的贡献符合：

- 使用清晰准确的语言
- 遵循现有的文档结构
- 检查拼写和语法

## 许可证

本项目根据 MIT 许可证授权 - 详见 [LICENSE](https://github.com/dhr2333/Beancount-Trans-Docs/blob/main/LICENSE.txt) 文件。

## 更多资源

- [Beancount-Trans 主项目](https://github.com/dhr2333/Beancount-Trans) - 主代码仓库
- [Docusaurus 文档](https://docusaurus.io/docs) - 了解更多关于 Docusaurus 的功能

## 联系方式

如有问题或建议，请通过以下方式联系：

- 在 GitHub 上创建 [Issue](https://github.com/dhr2333/Beancount-Trans-Docs/issues)
- 发送邮件至: <dai_haorui@163.com>

## 致谢

感谢所有为 Beancount-Trans 文档做出贡献的开发者们！
