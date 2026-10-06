---
name: find-internships
description: 实时搜索大厂、央国企、外企的实习和校招信息，并沉淀成本仓库的 MD 文档（一个搜索汇总页，加上每家公司一个详情页）。用户问「最近有没有可以投递的实习」「帮我看看国家电网/西门子的实习」「更新一下招聘信息」时使用。
---

# find-internships：实习搜索 → MD 文档

## 输入

用户的问题，可以带范围，例如：
- 「最近有没有可以投递的大厂实习？」→ 三类公司全扫一遍
- 「四川的水电企业有没有实习？」→ 只看 `soe`，限定地域
- 「更新一下西门子」→ 只更新一个公司页

## 步骤

1. **读画像**：先看 `profile/about-me.md`，确认专业、留学生身份、偏好和毕业届别。届别没填就两种情况都覆盖：日常实习和暑期实习，以及秋招
2. **定范围**：根据问题列出要搜的公司。没指定时，默认按 `companies/README.md` 已有的公司清单全部复查一遍，另外加 2 到 3 家新公司
3. **搜索**：用 WebSearch / WebFetch，中英文关键词都用。例如：
   - `<公司> 2027届 实习生招聘`、`<公司> 日常实习 AI`、`<公司> 校园招聘 留学生`
   - `<Company> China internship 2027 AI`、`<Company> graduate program China`
   - 公司多的时候，可以按分类并行派子 Agent 去搜
4. **核实**：每家公司至少要有 1 个官方来源。时间、网址、岗位名逐条对上来源
5. **写公司页**：按 `templates/company.md` 新建或更新 `companies/<分类>/<slug>.md`
6. **写搜索页**：按 `templates/search.md` 新建 `searches/YYYY-MM-DD-<主题>.md`，结果总览表的每一行都链接到公司页
7. **更新索引**：`searches/README.md`（新记录插到最上面）、`companies/README.md`、`README.md` 的「最新搜索」，以及 `guides/recruitment-calendar.md`
8. **检查链接**：执行下面的检查脚本，确保没有断链
9. **提交**：`git add -A && git commit -m "搜索：<主题>（YYYY-MM-DD）"`，然后 push 到当前分支
10. **回复用户**：用三五行讲最值得行动的结论，附上搜索页链接

## 链接检查脚本

```bash
python3 - <<'EOF'
import re, pathlib
bad = []
for md in pathlib.Path('.').rglob('*.md'):
    if '.git' in md.parts or 'templates' in md.parts:
        continue
    for link in re.findall(r'\]\(([^)#\s]+\.md)(?:#[^)]*)?\)', md.read_text(encoding='utf-8')):
        if link.startswith('http'):
            continue
        if not (md.parent / link).resolve().exists():
            bad.append(f'{md}: {link}')
print('\n'.join(bad) or 'All relative links OK')
EOF
```
