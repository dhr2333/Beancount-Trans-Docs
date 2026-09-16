---
tags: []
title: MCP 服务
slug: mcp
type: Write
Diátaxis: Reference
date: 2026-09-15
created_time: 2026-09-15T10:30:00
modify_time: 2026-09-15T10:30:00
authors: dhr2333
status: Published
channels:
  - Beancount-Trans-Docs
published_time: 2026-09-15T10:30:00
content_type: Article
domain: 项目文档
quadrant: 案例故事
---
## 进程与端点

MCP 服务与后端使用同一镜像，以**独立 ASGI 进程**运行，仅提供只读访问：

| 项目 | 值 |
| :--- | :--- |
| Compose 服务 | `beancount-trans-mcp` |
| 启动命令 | `uvicorn project.apps.mcp.asgi:app --host 0.0.0.0 --port 8001 --proxy-headers --forwarded-allow-ips '*'` |
| 容器内端口 | `8001`（仅在 Compose 网络内暴露，不映射宿主机） |
| 反向代理 | 前端 Nginx 按路径前缀 `/mcp` 转发至 `beancount-trans-mcp:8001` |
| 服务标识 | `name=beancount-trans`、`title=Beancount-Trans 账本` |
| 传输参数 | Streamable HTTP，`json_response=True`、`stateless_http=True`（单 JSON 响应、无会话、不使用 SSE） |

对外端点：

| 路径 | 上游 | 协议 |
| :--- | :--- | :--- |
| `/mcp` | `beancount-trans-mcp:8001` | MCP Streamable HTTP（POST） |
| `/.well-known/oauth-protected-resource/mcp` | `beancount-trans-backend:8000` | RFC 9728 受保护资源元数据 |
| `/.well-known/oauth-authorization-server` | `beancount-trans-backend:8000` | RFC 8414 授权服务器元数据 |
| `/register` | `beancount-trans-backend:8000` | RFC 7591 动态客户端注册（DCR） |
| `/authorize`、`/token`、`/revoke_token`、`/introspect` | `beancount-trans-backend:8000` | OAuth 2.1 授权码 + PKCE、令牌与撤销 |

`/.well-known` 必须挂在域名根路径，否则客户端无法发现授权服务器与资源元数据。

## 环境变量

| 变量名 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `MCP_RESOURCE_SERVER_URL` | 空 | MCP 端点对外地址（如 `https://example.com/mcp`）。**留空则不校验访问令牌**，仅可用于本地调试 |
| `MCP_ISSUER_URL` | 空 | 令牌签发方地址；留空时复用 `MCP_RESOURCE_SERVER_URL` |
| `MCP_AUTH_ENABLED` | `true` | 是否要求携带访问令牌；关闭后仅 `MCP_DEV_USERNAME` 可用 |
| `MCP_DEV_USERNAME` | 空 | 无令牌请求使用的本地开发用户；留空则拒绝所有未认证请求 |
| `MCP_REQUIRED_SCOPES` | `ledger:read` | 访问令牌必须具备的 scope（逗号分隔） |
| `MCP_ALLOWED_HOSTS` | `127.0.0.1:*,localhost:*,[::1]:*` | 端点 Host 白名单（DNS rebinding 防护）；不含客户端实际访问的域名与端口时返回 `400 Invalid Host header` |
| `MCP_ALLOWED_ORIGINS` | `http://127.0.0.1:*,http://localhost:*,http://[::1]:*` | 端点 Origin 白名单 |
| `MCP_MAX_FILE_BYTES` | `1048576` | `read_ledger_file` 单文件读取上限（字节） |
| `MCP_OAUTH_REDIRECT_URI_SCHEMES` | `http,https` | 允许的 OAuth 回调 URL scheme；使用自定义 scheme 的客户端（如 `cursor`）需追加 |

`MCP_AUTH_ENABLED=true` 且 `MCP_RESOURCE_SERVER_URL` 为空时，服务启动日志会输出「未配置 MCP_RESOURCE_SERVER_URL，MCP 服务将不校验访问令牌」并退化为无鉴权模式。

## 鉴权

### 令牌类型

| 类型 | 形态 | 校验方式 |
| :--- | :--- | :--- |
| 个人访问令牌（PAT） | `bct_` + 8 位十六进制前缀 + 32 位 URL-safe 随机串，明文仅在创建时返回一次 | 库内只保存**前缀与 SHA-256 摘要**，比对用 `hmac.compare_digest`；命中后更新 `last_used_at`（同一令牌 60 秒内只写一次） |
| OAuth 2.1 访问令牌 | 由 django-oauth-toolkit 签发 | 校验令牌记录未过期、所属用户 `is_active` |

校验顺序为 **PAT 优先，OAuth 2.1 兜底**（`PlatformTokenVerifier.verify_token`）。两类令牌的 scope 均为 `ledger:read`。

OAuth 2.1 关键参数：

| 参数 | 值 |
| :--- | :--- |
| scope | `ledger:read`（默认且唯一） |
| PKCE | 必需（`PKCE_REQUIRED=True`） |
| 动态客户端注册 | 开启（匿名可注册，RFC 7591） |
| Access Token 有效期 | 30 天 |
| Refresh Token 有效期 | 180 天，且开启轮换 |
| 授权页登录 | 复用 allauth 浏览器登录流程（`LOGIN_URL=/api/accounts/login/`） |

### 身份解析

- 请求携带令牌时，身份取自令牌 `subject`（用户主键），并校验用户 `is_active`；令牌对应的用户不存在或已停用时报错「访问令牌对应的用户不存在或已停用」。
- 请求未携带令牌时（仅在无鉴权模式下可能发生），回退到 `MCP_DEV_USERNAME` 指定的用户；未配置则报错「未提供访问令牌，且未配置 MCP_DEV_USERNAME 本地开发用户」。

### 失败响应

| 状态 | 条件 | 响应 |
| :--- | :--- | :--- |
| `401` | 未携带令牌、令牌无效/过期/已撤销 | 响应头 `WWW-Authenticate` 指向 RFC 9728 元数据，客户端据此发现授权服务器 |
| `400 Invalid Host header` | 请求 Host 不在 `MCP_ALLOWED_HOSTS` 中 | 文本错误 |

`401` 的响应头形如：

```text
WWW-Authenticate: Bearer error="invalid_token", error_description="Authentication required",
  resource_metadata="https://example.com/.well-known/oauth-protected-resource/mcp"
```

## 原语清单

### Tools

| 名称 | 入参 | 返回 | 说明 |
| :--- | :--- | :--- | :--- |
| `get_ledger_context` | 无 | 文本 | 平台账户/标签目录、账本实际账户、默认货币、BQL 语法与示例 |
| `run_bql` | `query: string` | `{bql, result_text, row_count, truncated}` | 执行只读 BQL；`row_count` 为截断前的总行数 |
| `read_ledger_file` | `path: string` | `{path, size_bytes, content}` | 读取账本目录内的 `.bean` 文件原文，`path` 为相对账本根目录的路径 |

工具失败时以 `ToolError` 返回，消息前缀区分原因：

| 前缀 | 触发条件 |
| :--- | :--- |
| `BQL 校验失败：` | 查询未通过只读校验 |
| `账本不可用：` | 用户账本文件缺失或无法解析 |
| `BQL 执行失败：` | 查询语法正确但执行报错 |

### Resources

| URI | `name` | MIME 类型 | 说明 |
| :--- | :--- | :--- | :--- |
| `ledger://accounts` | `accounts` | `text/plain` | 平台账户目录（账户路径 → 描述） |
| `ledger://tags` | `tags` | `text/plain` | 平台标签目录（完整标签路径 → 描述） |
| `ledger://bql-reference` | `bql_reference` | `text/plain` | beanquery 实际支持的 BQL 语法、推荐写法与常见失败原因 |
| `ledger://main.bean` | `main_bean` | `text/x-beancount` | 当前用户账本入口文件 `main.bean` 原文 |

### Prompts

| 名称 | 参数 | 说明 |
| :--- | :--- | :--- |
| `insight_review` | `period`（可选，默认「最近 3 个月」） | 账本洞察复盘：先跨期对比再追溯线索 |
| `monthly_review` | `period`（可选，默认「最近 3 个月」） | 月度复盘：收支总额、类目结构与环比、大额与异常交易 |

## 数据与安全边界

- **只读**：BQL 经 `validate_bql` 校验后才执行，规则如下。
  - 必须以 `SELECT` 开头；禁止多语句（`;`）。
  - 禁止 `INSERT`、`UPDATE`、`DELETE`、`DROP`、`CREATE`、`ALTER`、`ATTACH`、`DETACH`、`PRAGMA`。
  - 不支持 `HAVING`；WHERE 中不支持 `tags ~` 正则、`units(position) >/<` 与 `position >/<` 比较、聚合函数（须改用 `sum(units(position))` 与 `GROUP BY`）。
- **文件读取约束**：路径解析后必须位于该用户账本根目录内（拒绝 `../` 越界），后缀必须为 `.bean`，大小不超过 `MCP_MAX_FILE_BYTES`。
- **用户隔离**：所有能力都以令牌所属用户为作用域，无法跨用户读取账本。
- **结果截断**：`run_bql` 单次最多返回 `ASSISTANT_MAX_BQL_ROWS`（默认 100）行，截断时在结果末尾追加提示。

## 相关文档

- [自托管](https://trans.dhr2333.cn/docs/developer/self-host#接入-ai-客户端mcp)：MCP 服务的部署与 `.env` 配置步骤
- [接入 AI 客户端](https://trans.dhr2333.cn/docs/%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97/connect-ai-client)：面向使用者的令牌创建与客户端配置指南
- [参考](https://trans.dhr2333.cn/docs/developer/reference)：全部环境变量与 HTTP 端点索引
