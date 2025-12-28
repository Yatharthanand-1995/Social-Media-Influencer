# Claude Development Checklist

Quick reference checklist for Claude to follow during development.

---

## 🏁 START OF WORK

- [ ] Read `.claude/opus-style-guide.md` for quality standards
- [ ] Read `.claude/workflow.md` for full instructions
- [ ] Check current git branch: `git branch --show-current`
- [ ] If on `main` → STOP and ask user to create feature branch
- [ ] If on feature branch → Proceed

**Prompt if on main:**
> ⚠️ You're on the main branch. Please create a feature branch:
> ```bash
> git checkout -b feature/your-feature-name
> ```

---

## 💻 DURING DEVELOPMENT

- [ ] Write clean, typed code
- [ ] Add JSDoc comments to complex functions
- [ ] No `console.log` or `debugger` statements
- [ ] Handle errors properly
- [ ] Use proper TypeScript types (no `any`)

---

## ✅ BEFORE COMPLETING TASK

### 1. Code Quality
- [ ] Run type check: `npm run type-check`
- [ ] Run build: `npm run build`
- [ ] Fix any errors found

### 2. Documentation Updates
- [ ] Update `PROJECT_STATUS.md` (if major feature)
- [ ] Update `CHANGELOG.md` (always)
- [ ] Add/update code comments
- [ ] Update `.env.example` (if new env vars)

### 3. File Review
- [ ] List all files modified
- [ ] List all files created
- [ ] Verify no temporary/test files included

---

## 📝 PROMPT USER TO COMMIT

**Use this template:**

```
✅ Implementation complete!

Summary of changes:
[Brief description]

Files modified:
- [list]

Files created:
- [list]

Next steps:

1️⃣ Review changes:
   git status
   git diff

2️⃣ Commit with proper message:
   git add .
   git commit -m "type(scope): description"

3️⃣ Push to remote:
   git push origin [branch-name]

Ready to commit? I can help format the commit message.
```

---

## 🔄 AFTER USER COMMITS

**Offer options:**

```
Great! What's next?

a) Continue on this feature
b) Create Pull Request
c) Start new feature (new branch needed)
d) Review what we've built

Let me know!
```

---

## 🎯 FEATURE COMPLETE

- [ ] All code committed
- [ ] Documentation updated
- [ ] Tests passing (if applicable)
- [ ] Build successful
- [ ] No uncommitted changes

**Prompt for PR:**

```
🎉 Feature complete!

Final steps:

1️⃣ Push (if not yet pushed):
   git push origin feature/[name]

2️⃣ Create Pull Request on GitHub

3️⃣ After approval, merge and cleanup:
   git checkout main
   git pull origin main
   git branch -d feature/[name]
```

---

## 📊 SESSION END

**Verify:**
- [ ] Current branch noted
- [ ] Uncommitted changes handled
- [ ] User knows next steps
- [ ] No broken code

**End message:**

```
📋 Session Complete

Completed:
- [list work done]

Current state:
- Branch: [name]
- Commits: [count]
- Status: [clean/uncommitted]

To resume:
git checkout [branch-name]
npm run dev

See you next time! 👋
```

---

## ⚠️ RED FLAGS - STOP AND ASK

Stop and ask user if:
- [ ] About to commit to `main` directly
- [ ] Build/type-check failing
- [ ] Deleting important files
- [ ] Breaking changes
- [ ] Security concerns

---

## 🎯 COMMIT MESSAGE FORMAT

```
<type>(<scope>): <subject>

Types: feat, fix, docs, test, refactor, chore, perf
Scope: component/feature name
Subject: what changed (imperative mood)

Examples:
✅ feat(auth): add OAuth login
✅ fix(api): handle null values
✅ docs(readme): update setup guide
❌ updated stuff
❌ fixed bug
```

---

## 📁 DOCUMENTATION UPDATES

### PROJECT_STATUS.md
**Update when:**
- Starting/completing phase
- Major feature added
- Architecture change
- New models/services

**Sections:**
- Status summary table
- What's implemented
- Progress percentage
- Key file locations

### CHANGELOG.md
**Always update with:**
- Version number
- Date
- Type (Added/Changed/Fixed)
- Description of changes

**Format:**
```markdown
## [2.1.0] - 2025-12-XX

### Added
- Feature description

### Changed
- What changed

### Fixed
- Bug fix description
```

---

## 🛠️ COMMON COMMANDS

```bash
# Branch management
git branch --show-current
git checkout -b feature/name
git checkout main

# Status and review
git status
git diff
git log --oneline -5

# Commit workflow
git add .
git commit -m "type(scope): message"
git push origin branch-name

# Project checks
npm run type-check
npm run build
npm run dev

# Database
npm run db:push
npx prisma generate
npx prisma studio
```

---

## 🎓 BEST PRACTICES REMINDER

1. **Branch Management**
   - Feature branches for all work
   - Descriptive branch names
   - Regular commits

2. **Code Quality**
   - Type safety always
   - Error handling
   - Clean code
   - Documentation

3. **Git Workflow**
   - Small, focused commits
   - Clear commit messages
   - Regular pushes
   - Pull requests

4. **Documentation**
   - Keep status current
   - Track all changes
   - Comment complex logic
   - Update env examples

5. **Communication**
   - Clear prompts to user
   - Explain what's happening
   - Offer next steps
   - Confirm before destructive actions

---

**Reference:** See `.claude/workflow.md` for detailed instructions

**Last Updated:** December 28, 2025
