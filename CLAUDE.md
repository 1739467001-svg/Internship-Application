# CLAUDE.md：实习问答系统的工作约定

这个仓库是一套**以 Markdown 为底层的实习搜索和投递系统**（同时用 VitePress 渲染成网站）。仓库主人在对话里问 Claude 实习相关的问题（例如「最近有没有可以投递的大厂实习？」），Claude 实时搜索，然后把结果沉淀成 MD 文档。

## 仓库主人画像（回答前必读）

- 详见 `profile/about-me.md` 和 `profile/slogan.md`
- 要点：人工智能专业**硕士**（MSc），在 University of Sussex（英国）读书，国内招聘算**海外留学生**。届别按学位证颁发日期判断（央企常见「境外毕业时间窗口 + 留服认证」，互联网大厂常见「以学位证日期为准」），每个公司页都要写清楚他在这家算哪一届。有雅思，能用英语工作。擅长 Java 和 Python，有 AI 应用项目经验，习惯 Vibe Coding
- 偏好 **AI × 传统行业**。三类目标公司：AI 科技大厂的行业线、传统行业央国企（电网、烟草、水利水电，尤其四川）、外企和跨国国企
- 实习目的：学习工作流程和管理经验，看清社会规则。长期目标是创业

## 目录约定

| 路径 | 作用 |
| --- | --- |
| `README.md` | 首页和导航，「最新搜索」「公司库速览」要保持最新 |
| `searches/YYYY-MM-DD-<英文短横线主题>.md` | **每次搜索一个文档**（文件名用英文，例如 `2026-11-15-state-grid-batch1.md`），集中展示这次搜到的所有结果，每条都链接到公司详情页。front matter 必填 `date`、`topic`、`count`、`question` |
| `searches/README.md` | 所有搜索记录的索引，新的在上 |
| `companies/<分类>/<slug>.md` | **每家公司一个详情页**，分类目录：`ai-tech`、`soe`、`foreign`。front matter 是看板和索引的数据源，字段见 `templates/company.md` |
| `companies/README.md` | 公司库总索引（`AUTO` 标记之间自动生成，不要手改） |
| `guides/` | 招聘日历、投递追踪表、系统说明 |
| `templates/` | `company.md`、`search.md` 模板。新建文档必须按模板来 |
| `profile/` | 个人画像和 Slogan。只有仓库主人要求时才改 |
| `board.md`、`.vitepress/` | 网站：交互式看板、配置、主题组件 |
| `scripts/` | `build-index.mjs` 生成索引，`check.mjs` 自检 |

## 每次「搜索实习」的工作流

用户问到实习、校招、某家公司的招聘时，按 `.claude/skills/find-internships/SKILL.md` 执行。核心规则：

1. **实时搜索，不靠记忆。** 招聘信息必须来自本次实际打开过的网页。优先官方招聘站，其次是高校就业网转载和权威媒体
2. **绝不编造。** 岗位名、时间、网址都要有出处。核实不了的就写上「（待核实）」
3. **注明日期。** 每个公司页都要写「最后核实」日期。时间敏感的信息写清楚「截至 YYYY-MM-DD」
4. **一次搜索产出一个 `searches/` 文档**，每个公司有一个 `companies/` 详情页。公司页已存在时就**更新**，不要重复新建，并在页尾的「更新记录」里加一行
5. **更新索引**：运行 `npm run index`，自动刷新 `README.md`、`companies/README.md`、`searches/README.md` 中 `<!-- AUTO:... -->` 标记之间的内容。`guides/recruitment-calendar.md` 需要手动更新
6. **链接一律用相对路径并带 `.md` 后缀**，保证在 GitHub 上点了能跳转，网站上也能正确转换。不要用 `#` 锚点链接到中文标题（GitHub 和 VitePress 生成锚点的规则不同）
7. **自检**：运行 `npm run check`，必须通过。需要的话再运行 `npm run build` 确认网站能构建
8. 每个公司页必须有「AI 赋能切入点」和「为什么适合我」两节，要结合仓库主人的背景来写，不要泛泛而谈
9. 完成后 commit 并 push。commit message 用中文，简要说明本次搜索的主题
10. **把结果发给用户**：运行 `npm run export -- searches/<本次文件>.md`，生成 `exports/<同名>.md`（搜索汇总加上所有相关公司详情，合并成一份完整的 MD），然后用 `SendUserFile` 发给用户。没有这个工具的环境（例如 GitHub Action），就在回复里给出搜索页链接。`exports/` 不进仓库

## 写作风格

- 中文为主。外企页面可以附英文岗位原名和英文自我介绍要点
- 表格优先，信息密度高，不灌水
- 状态图例统一：🟢 开放中　🟡 即将开放　🔵 滚动招聘　🔴 已截止
- 匹配度统一用 1 到 5 颗 ⭐（front matter 里的 `match` 写 1 到 5 的整数）
- front matter 里的 `status` 只能是 `open`、`upcoming`、`rolling`、`closed`
- 核实不了原文（例如网站被拦截，只看到搜索摘要）时，在页尾写明「核实方式」
