---
name: find-internships
description: 实时搜索大厂、央国企、外企的实习和校招信息，并沉淀成本仓库的 MD 文档（一个搜索汇总页，加上每家公司一个详情页），同时更新网站看板。用户问「最近有没有可以投递的实习」「帮我看看国家电网/西门子的实习」「更新一下招聘信息」时使用。
---

# find-internships：实习搜索 → MD 文档 → 网站

## 输入

用户的问题，可以带范围，例如：
- 「最近有没有可以投递的大厂实习？」→ 三类公司全扫一遍
- 「四川的水电企业有没有实习？」→ 只看 `soe`，限定地域
- 「更新一下西门子」→ 只更新一个公司页

## 步骤

1. **读画像**：先看 `profile/about-me.md`、`profile/resume.md`、`profile/portfolio.md`。要点：中外合作办学的 Sussex MSc，**学位证 2027-03**，各公司都按 2027 届判断；**实习只能在读期间做（现在到 2027-02）**，2028 届暑期实习不适用；实习目的是体验行业，全职校招是可选项。对每家公司，都要写清楚他在这家算哪一届、现在能做什么实习，以及硕士身份能解锁哪些项目
2. **定范围**：根据问题列出要搜的公司。没指定时，默认按 `companies/README.md` 已有的公司清单全部复查一遍，另外加 2 到 3 家新公司
3. **搜索**：用 WebSearch / WebFetch，中英文关键词都用。例如：
   - `<公司> 2027届 实习生招聘`、`<公司> 日常实习 AI`、`<公司> 校园招聘 留学生`
   - `<Company> China internship 2027 AI`、`<Company> graduate program China`
   - 公司多的时候，可以按分类（ai-tech / soe / foreign）并行派子 Agent 去搜
4. **核实**：每家公司至少要有 1 个官方来源，或者高校就业网转载的官方公告。时间、网址、岗位名逐条对上来源。只看到搜索摘要、没打开原文的，在页尾「核实方式」里写清楚
5. **写公司页**：按 `templates/company.md` 新建或更新 `companies/<分类>/<slug>.md`。**front matter 字段要完整**：`status` 用 open / upcoming / rolling / closed，`match` 写 1 到 5，`verified` 写今天的日期。已有页面只改有变化的部分，并在「更新记录」里加一行
   - **「🔗 直达链接」**：这次搜到的具体网址（官方入口、公告、岗位 JD、宣讲通知、高校转载）全部写进去，打不开的也写，只写搜索结果里真实出现过的
   - **🔴 已截止的项目**：同一行写「→ **下次关注**：<下一次机会和时间>」
   - **「为什么适合我」**：点名 `profile/portfolio.md` 里的具体作品（写成链接），讲清楚怎么对上这家公司的业务
6. **写搜索页**：按 `templates/search.md` 新建 `searches/YYYY-MM-DD-<英文主题>.md`。front matter 要有 `date`、`topic`、`count`、`question`。结果总览表的每一行都链接到公司页；时间线按紧急程度排序
7. **更新索引**：`npm run index`（自动更新 README、公司库、搜索记录）。如果有新的关键日期，手动更新 `guides/recruitment-calendar.md`；有新过期的项目，手动更新 `guides/expired-watchlist.md`
8. **自检**：`npm run check` 必须通过。改了网站相关文件的话，再跑一次 `npm run build`
9. **提交并合并**：`git add -A && git commit -m "搜索：<主题>（YYYY-MM-DD）"`，push 到当前分支，然后开 PR 合并到默认分支（CI 通过后再合并）
10. **导出并发送**：`npm run export -- searches/<本次文件>.md`，得到 `exports/<同名>.md`（汇总加上所有相关公司详情合并成一份，链接已改成文内跳转和 GitHub 地址）。有 `SendUserFile` 工具时，用它把这个文件发给用户（status 用 normal，caption 写一句最重要的结论）
11. **回复用户**：用三五行讲最值得行动的结论（特别是 7 天内截止的），附上搜索页链接

## 常用命令

```bash
npm install          # 首次使用
npm run index        # 根据 front matter 重新生成索引
npm run check        # 字段校验、断链检查、索引是否最新
npm run build        # 构建网站（会额外检查网站上的死链）
npm run export       # 把最新一次搜索导出成一份完整的 MD（也可以指定文件）
```
