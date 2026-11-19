# Skill Selection Justification

## Date: 2026-08-05

## Discovery method

Skills were discovered with the skills CLI (`npx skills find <topic>`); each result links to its page on skills.sh and is installed with `npx skills add <owner/repo@skill>`.

Re-run on 2026-11-19 to keep evidence in the repo (results and install counts change over time):

| Command | Relevant results |
|---------|------------------|
| `npx skills find kpi` | `wshobson/agents@kpi-dashboard-design` (17.8K installs) ← selected skill, `mbfinotti/revops-skills@revenue-kpi-framework` (27.7K) |
| `npx skills find dashboard` | `firecrawl/firecrawl-workflows@firecrawl-dashboard-reporting` (32K), `anthropics/knowledge-work-plugins@build-dashboard` (9.7K) |
| `npx skills find performance` | `addyosmani/web-quality-skills@performance` (45.4K), `convex/agent-skills@convex-performance-audit` (94.3K) |

## Skills Explored (original session, 2026-08-05)

### 1. Performance Skills
- `get-convex/agent-skills@convex-performance-audit` (94.3K installs)
- `addyosmani/web-quality-skills@performance` (27.1K installs)
- `wshobson/agents@python-performance-optimization` (30.5K installs)

### 2. SEO Skills
- `coreyhaines31/marketingskills@seo-audit` (178.9K installs)
- `addyosmani/web-quality-skills@seo` (37.3K installs)

### 3. TypeScript Skills
- `wshobson/agents@typescript-advanced-types` (57.9K installs)
- `dotneet/claude-code-marketplace@typescript-react-reviewer` (8K installs)

### 4. Testing Skills
- `anthropics/skills@webapp-testing` (127.1K installs)
- `wshobson/agents@python-testing-patterns` (29.1K installs)

### 5. Dashboard-Specific Skills
- `wshobson/agents@kpi-dashboard-design` (12.3K installs) ← **SELECTED**
- `anthropics/knowledge-work-plugins@data-visualization` (10.8K installs)

---

## Selected Skill: `kpi-dashboard-design`

### Justification

**Why this skill was chosen over others:**

1. **Direct Relevance**: This is a financial dashboard project with KPIs (Total Income, Total Outcome, Profit, Profit Margin). The `kpi-dashboard-design` skill is specifically designed for KPI dashboards, making it the most directly applicable skill.

2. **Complementary to Existing Skills**: The project already has:
   - `accessibility` skill (WCAG compliance)
   - `vercel-react-best-practices` skill (React/Next.js performance)
   
   The KPI dashboard design skill adds **domain-specific knowledge** about dashboard design patterns that the other skills don't cover.

3. **Practical Value**: The skill provides:
   - KPI framework and hierarchy patterns
   - Dashboard layout best practices
   - Real-world examples for finance departments
   - Troubleshooting patterns for common dashboard issues

4. **Immediate Impact**: Applied improvements include:
   - Added trend indicators to KPI cards (comparing current vs previous period)
   - Added methodology section explaining how metrics are calculated
   - Followed the "5-7 KPIs" best practice (project has 4 KPIs)
   - Added context with "vs prev. period" labels

### Other Skills Considered

- **Performance**: Already covered by `vercel-react-best-practices` skill
- **SEO**: Less critical for an internal financial dashboard
- **TypeScript**: Project already uses TypeScript effectively
- **Testing**: Important but not as directly impactful as dashboard design patterns

---

## Files Modified

1. `frontend/src/components/dashboard/kpi-card.tsx` - Added trend indicators
2. `frontend/src/components/dashboard/kpi-row.tsx` - Added trend props
3. `frontend/src/App.tsx` - Added trend calculations and methodology section
4. `frontend/app/dashboard-client.tsx` - Same improvements for Next.js version

## Results

- KPI cards now show trend indicators (↑/↓ with percentage change)
- Dashboard includes methodology section explaining calculation formulas
- Follows KPI dashboard design best practices from the skill
- Maintains accessibility compliance (WCAG AA)
