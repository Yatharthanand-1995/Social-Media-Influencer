# Claude Code Workflow Instructions

**Purpose:** This file contains mandatory workflow steps that Claude should follow when working on this project.

---

## 🚨 CRITICAL: Read This Before Starting Any Work

**Required Reading:**
1. **`.claude/opus-style-guide.md`** - Quality standards and Opus-level working style
2. **This workflow file** - Mandatory process steps

When the user asks you to implement features or make changes, **ALWAYS** follow this workflow:

---

## 📋 Pre-Work Checklist

### Step 1: Verify Current Branch
```bash
# Check current branch
git branch --show-current
```

**Action Required:**
- If on `main` → STOP and ask user to create feature branch
- If on feature branch → Proceed with work

### Step 2: Ask User to Create Feature Branch (if needed)

**When on main branch, prompt user:**

```
⚠️ You're currently on the main branch.

Before we start, let's create a feature branch following best practices:

Suggested branch name: feature/[feature-name]
Examples:
- feature/agency-dashboard
- feature/enhanced-filtering
- bugfix/authentication-error

Please run:
git checkout -b feature/your-feature-name

Once done, let me know and I'll proceed with the implementation.
```

**DO NOT proceed with code changes until user creates branch!**

---

## 💻 During Development

### Always Do:
1. ✅ Run type checks before committing
2. ✅ Keep commits small and focused
3. ✅ Use conventional commit messages
4. ✅ Update relevant documentation
5. ✅ Test changes when possible

### Never Do:
❌ Commit directly to main
❌ Leave console.log or debugger statements
❌ Skip documentation updates
❌ Use vague commit messages
❌ Commit broken code

---

## 📝 Commit Message Format

**ALWAYS use this format:**

```
<type>(<scope>): <subject>

Examples:
feat(algorithm): add 9-factor scoring system
fix(api): correct ZodError property reference
docs(guide): add workflow instructions
test(enrichment): add authenticity service tests
refactor(services): extract common error handling
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `test` - Tests
- `refactor` - Refactoring
- `chore` - Maintenance
- `perf` - Performance

---

## ✅ Post-Implementation Checklist

After completing implementation, **ALWAYS** run through this checklist:

### Step 1: Type Check
```bash
npm run type-check
```
**If errors:** Fix them before proceeding

### Step 2: Build Check
```bash
npm run build
```
**If errors:** Fix them before proceeding

### Step 3: Update Documentation

**Files to update:**
- `PROJECT_STATUS.md` - If adding new features or completing phases
- `CHANGELOG.md` - Always update with changes
- Code comments - Add JSDoc to new functions
- `.env.example` - If adding new environment variables

### Step 4: Prompt User to Commit

**Template message to user:**

```
✅ Implementation complete! Here's what we've done:

[List of changes made]

Files modified:
- [List files]

Files created:
- [List files]

Next steps:

1️⃣ Review the changes:
git status
git diff

2️⃣ Add and commit:
git add .
git commit -m "feat(scope): descriptive message"

3️⃣ Push to remote:
git push origin [branch-name]

4️⃣ Create Pull Request on GitHub

Would you like me to help with anything else, or shall we create the PR?
```

---

## 🔄 After User Commits

### Offer Next Steps

**Template message:**

```
Great! Your changes are committed.

Options:
1. Continue working on this feature
2. Push and create Pull Request
3. Start a new feature (will need new branch)
4. Merge to main (after PR approval)

What would you like to do next?
```

---

## 🎯 Feature Completion Workflow

When feature is fully complete:

### Step 1: Final Checks
- [ ] All code committed
- [ ] Documentation updated
- [ ] Tests passing (if applicable)
- [ ] Build successful

### Step 2: Prompt for PR

```
🎉 Feature complete!

To finalize:

1️⃣ Push your branch (if not already):
git push origin feature/your-feature-name

2️⃣ Create Pull Request on GitHub:
- Go to your repository
- Click "Compare & pull request"
- Add description of changes
- Request review (if working with team)

3️⃣ After PR approval:
git checkout main
git pull origin main
git branch -d feature/your-feature-name

Ready to start the next feature?
```

---

## 🚀 Starting New Session

At the start of each conversation or when user returns:

### Welcome Back Message

```
👋 Welcome back!

Current status:
- Branch: [current branch name]
- Last commit: [show if possible]
- Uncommitted changes: [check if any]

What would you like to work on today?

Note: If starting new feature, we should create a new branch.
```

---

## 📚 Documentation Updates

### When to Update PROJECT_STATUS.md

**Update when:**
- ✅ Starting new phase
- ✅ Completing major feature
- ✅ Changing architecture
- ✅ Adding new services/models
- ✅ Major milestone reached

**Sections to update:**
- Status summary table
- What's been implemented
- Current progress percentage
- Files created/modified

### When to Update CHANGELOG.md

**ALWAYS update for:**
- ✅ New features
- ✅ Bug fixes
- ✅ Breaking changes
- ✅ Deprecations
- ✅ Security fixes

**Format:**
```markdown
## [Version] - Date

### Added
- New feature description

### Changed
- What changed

### Fixed
- What was fixed
```

---

## 🔧 Common Commands Reference

```bash
# Check current branch
git branch --show-current

# Create feature branch
git checkout -b feature/name

# Check status
git status

# View changes
git diff

# Stage changes
git add .

# Commit
git commit -m "type(scope): message"

# Push
git push origin branch-name

# Type check
npm run type-check

# Build
npm run build

# Database
npm run db:push
npx prisma generate
```

---

## ⚠️ Warning Scenarios

### Scenario 1: User Wants to Commit to Main

**If user tries to commit directly to main:**

```
⚠️ STOP! You're about to commit directly to main.

Best practice is to:
1. Create feature branch
2. Make changes there
3. Create Pull Request
4. Review and merge

Would you like to:
a) Create a feature branch now
b) Proceed anyway (not recommended)
```

### Scenario 2: Broken Build

**If build fails:**

```
⚠️ Build failed with errors.

Errors found:
[List errors]

We need to fix these before committing. Let me address them:
[Fix the issues]
```

### Scenario 3: No Documentation Updates

**Before finalizing, if docs not updated:**

```
📝 Reminder: Documentation needs updating

We should update:
- PROJECT_STATUS.md (if major feature)
- CHANGELOG.md (always)
- Code comments (for complex logic)

Shall I update these now?
```

---

## 📋 Session End Checklist

Before ending session, verify:

- [ ] All changes committed (or stashed)
- [ ] Documentation updated
- [ ] User knows current branch
- [ ] Clear next steps provided
- [ ] No broken code left

**End of session message:**

```
📋 Session Summary

Work completed:
[List what was done]

Current state:
- Branch: [branch-name]
- Status: [committed/uncommitted]
- Next step: [what's next]

To continue later:
git checkout [branch-name]
npm run dev

See you next time! 👋
```

---

## 🎯 Quick Decision Tree

```
User requests work
    ↓
Check current branch
    ↓
Is it main?
    ├─ Yes → Ask to create feature branch → WAIT
    └─ No → Proceed with implementation
        ↓
    Implement changes
        ↓
    Run type-check & build
        ↓
    Update documentation
        ↓
    Prompt user to commit
        ↓
    Offer next steps
```

---

## 💡 Remember

1. **Always check branch before coding**
2. **Always ask for feature branch if on main**
3. **Always run checks before committing**
4. **Always update documentation**
5. **Always guide user through git workflow**
6. **Always provide clear next steps**

---

**This workflow ensures:**
- ✅ Clean commit history
- ✅ Proper branching strategy
- ✅ Updated documentation
- ✅ Quality code
- ✅ Clear project status
- ✅ Good development habits

---

**Last Updated:** December 28, 2025
**Version:** 1.0
