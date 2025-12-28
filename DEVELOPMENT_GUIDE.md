# Development Guide - Best Practices

A comprehensive guide for developing and maintaining the InfluencerMatch platform.

---

## 📋 Table of Contents

1. [Git Workflow](#git-workflow)
2. [Branch Strategy](#branch-strategy)
3. [Commit Message Guidelines](#commit-message-guidelines)
4. [Code Organization](#code-organization)
5. [Documentation Standards](#documentation-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [TypeScript Best Practices](#typescript-best-practices)
8. [Database Management](#database-management)
9. [API Development](#api-development)
10. [Code Review Process](#code-review-process)

---

## 🌳 Git Workflow

### Recommended Workflow

```bash
# 1. Always start from updated main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes and commit regularly
git add .
git commit -m "feat: descriptive message"

# 4. Keep branch updated with main
git fetch origin
git rebase origin/main

# 5. Push to remote
git push origin feature/your-feature-name

# 6. Create Pull Request on GitHub
# 7. After PR approval, merge to main
# 8. Delete feature branch
git checkout main
git pull origin main
git branch -d feature/your-feature-name
```

### Common Git Commands

```bash
# Check status
git status

# View changes
git diff

# Stage specific files
git add path/to/file

# Commit with message
git commit -m "type: message"

# Amend last commit (before push)
git commit --amend

# Discard local changes
git checkout -- path/to/file

# Stash changes temporarily
git stash
git stash pop

# View commit history
git log --oneline --graph
```

---

## 🌿 Branch Strategy

### Branch Naming Convention

```
Type        Description                    Example
────────────────────────────────────────────────────────────
feature/    New features                   feature/agency-dashboard
bugfix/     Bug fixes                      bugfix/authentication-error
hotfix/     Urgent production fixes        hotfix/api-timeout
refactor/   Code refactoring              refactor/scoring-algorithm
docs/       Documentation updates          docs/api-documentation
test/       Adding/updating tests          test/enrichment-service
chore/      Maintenance tasks             chore/update-dependencies
```

### Branch Types

**Main Branches:**
- `main` - Production-ready code
- `develop` - Development integration branch (optional)

**Supporting Branches:**
- `feature/*` - New features (create from main)
- `bugfix/*` - Bug fixes (create from main)
- `hotfix/*` - Emergency fixes (create from main, merge ASAP)

### Example Branch Lifecycle

```bash
# Create feature branch
git checkout -b feature/enhanced-filtering

# Work on feature
git add .
git commit -m "feat: add authenticity score filter"
git commit -m "feat: add growth trend filter"
git commit -m "test: add filtering unit tests"

# Push to remote
git push origin feature/enhanced-filtering

# Create Pull Request (on GitHub)
# After review and approval, merge to main
# Delete feature branch
git branch -d feature/enhanced-filtering
git push origin --delete feature/enhanced-filtering
```

---

## 📝 Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(algorithm): add 9-factor scoring system"

# Bug fix
git commit -m "fix(api): correct ZodError property from errors to issues"

# Documentation
git commit -m "docs: add development guide and best practices"

# Refactor
git commit -m "refactor(services): extract common error handling"

# Test
git commit -m "test(enrichment): add unit tests for authenticity service"

# With body
git commit -m "feat(filtering): add advanced enrichment filters

Added 9 new filter criteria including authenticity score,
growth trend, and reliability metrics. Updated UI to display
filter counts."
```

### Commit Best Practices

✅ **DO:**
- Use present tense ("add" not "added")
- Start with lowercase
- Keep subject under 50 characters
- Use body for detailed explanation
- Reference issues/PRs in footer

❌ **DON'T:**
- End subject with period
- Use vague messages like "fix bug" or "update code"
- Commit unrelated changes together
- Commit broken code

---

## 📁 Code Organization

### Project Structure

```
influencer-platform/
├── app/                        # Next.js App Router
│   ├── api/                   # API routes
│   │   ├── recommend/         # Original API
│   │   ├── recommend-v2/      # Enhanced API
│   │   ├── cron/              # Cron jobs
│   │   └── admin/             # Admin endpoints
│   ├── auth/                  # Authentication pages
│   ├── discover/              # Discovery page
│   └── ...
├── components/                 # React components
│   ├── Navigation.tsx
│   ├── ErrorBoundary.tsx
│   └── ...
├── lib/                       # Core library code
│   ├── algorithms/            # Recommendation algorithms
│   │   ├── scoring-v2.ts     # Enhanced scoring
│   │   ├── filtering-enhanced.ts
│   │   ├── matching-enhanced.ts
│   │   └── types.ts
│   ├── services/              # Business logic services
│   │   ├── authenticity-service.ts
│   │   ├── performance-tracking-service.ts
│   │   ├── content-analysis-service.ts
│   │   └── data-enrichment-service.ts
│   ├── validations/           # Zod schemas
│   ├── auth.ts               # NextAuth configuration
│   └── prisma.ts             # Prisma client
├── prisma/                    # Database
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Seed data
│   └── migrations/           # Migration history
├── scripts/                   # Utility scripts
│   ├── test-enrichment.ts
│   └── ...
├── public/                    # Static assets
├── docs/                      # Documentation (create this)
│   ├── PROJECT_STATUS.md
│   ├── CHANGELOG.md
│   └── DEVELOPMENT_GUIDE.md
└── ...
```

### File Naming Conventions

```
Type              Convention           Example
──────────────────────────────────────────────────────────
Components        PascalCase.tsx       Navigation.tsx
Services          kebab-case.ts        authenticity-service.ts
Utilities         kebab-case.ts        format-date.ts
Types/Interfaces  kebab-case.ts        types.ts
API Routes        route.ts             route.ts (Next.js convention)
Pages             page.tsx             page.tsx (Next.js convention)
```

---

## 📖 Documentation Standards

### What to Document

1. **Complex Functions** - Add JSDoc comments
2. **Services** - File-level description and method documentation
3. **API Routes** - Request/response formats, authentication
4. **Database Models** - Field descriptions in schema
5. **Algorithms** - Explanation of logic and formulas

### JSDoc Example

```typescript
/**
 * Calculate authenticity score for an influencer
 *
 * Analyzes follower quality, engagement patterns, and verification status
 * to determine overall authenticity (0-100 scale)
 *
 * @param influencer - Enhanced influencer with enrichment data
 * @returns Authenticity score from 0-10 points
 *
 * @example
 * const score = calculateAuthenticityScore(influencer)
 * // Returns: 8.5 (high authenticity)
 */
export function calculateAuthenticityScore(
  influencer: EnhancedInfluencerForScoring
): number {
  // Implementation...
}
```

### README Sections to Include

- Project overview
- Quick start guide
- Environment setup
- Available scripts
- Tech stack
- Deployment instructions

### Documentation Files to Maintain

1. `PROJECT_STATUS.md` - Current status, architecture, progress
2. `CHANGELOG.md` - Version history, changes
3. `DEVELOPMENT_GUIDE.md` - This file, best practices
4. `API_DOCUMENTATION.md` - API endpoints (create as needed)
5. `DEPLOYMENT.md` - Deployment instructions (create as needed)

---

## 🧪 Testing Guidelines

### Testing Strategy

```
Unit Tests        → Individual functions
Integration Tests → Service interactions
API Tests         → Endpoint testing
E2E Tests         → Full user workflows (Phase 4)
```

### Test File Structure

```typescript
// services/__tests__/authenticity-service.test.ts
import { AuthenticityService } from '../authenticity-service'

describe('AuthenticityService', () => {
  describe('calculateAuthenticityScore', () => {
    it('should return high score for verified accounts', () => {
      // Test implementation
    })

    it('should penalize high risk accounts', () => {
      // Test implementation
    })
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- authenticity-service.test.ts

# Watch mode
npm test -- --watch
```

### Testing Best Practices

✅ **DO:**
- Write tests before fixing bugs
- Test edge cases and error conditions
- Use descriptive test names
- Keep tests independent
- Mock external dependencies

❌ **DON'T:**
- Test implementation details
- Write flaky tests
- Skip tests in CI/CD
- Leave commented test code

---

## 💻 TypeScript Best Practices

### Type Safety

```typescript
// ✅ Good: Explicit types
function calculateScore(
  influencer: EnhancedInfluencerForScoring,
  requirements: BrandRequirements
): number {
  // Implementation
}

// ❌ Bad: Using 'any'
function calculateScore(influencer: any, requirements: any): any {
  // Implementation
}
```

### Interface vs Type

```typescript
// Use interfaces for object shapes
interface User {
  id: string
  name: string
  email: string
}

// Use types for unions, intersections, primitives
type Status = 'active' | 'inactive' | 'pending'
type ID = string | number
```

### Null Safety

```typescript
// ✅ Good: Handle null/undefined
if (influencer.authenticity) {
  const score = influencer.authenticity.overallAuthenticityScore
}

// ✅ Good: Optional chaining
const score = influencer.authenticity?.overallAuthenticityScore ?? 0

// ❌ Bad: Assuming non-null
const score = influencer.authenticity!.overallAuthenticityScore
```

### Type Checking Commands

```bash
# Check types without building
npm run type-check

# Or manually
npx tsc --noEmit
```

---

## 🗄️ Database Management

### Schema Changes Workflow

```bash
# 1. Update prisma/schema.prisma
# Edit the file

# 2. Generate Prisma client
npx prisma generate

# 3. Create migration (production)
npx prisma migrate dev --name descriptive-name

# OR push changes (development)
npm run db:push

# 4. Verify changes
npx prisma studio
```

### Migration Best Practices

✅ **DO:**
- Create descriptive migration names
- Test migrations on dev database first
- Add indexes for frequently queried fields
- Document breaking schema changes

❌ **DON'T:**
- Modify existing migrations (create new ones)
- Skip migrations in production
- Delete data without backups

### Seed Data

```bash
# Run seed script
npx tsx prisma/seed.ts

# Run extended seed
npx tsx prisma/seed-extended.ts

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

---

## 🔌 API Development

### API Route Structure

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validation
    const body = await request.json()
    const validated = schema.parse(body)

    // 3. Business logic
    const result = await yourService.doSomething(validated)

    // 4. Response
    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    // 5. Error handling
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### API Best Practices

✅ **DO:**
- Validate all inputs with Zod
- Use proper HTTP status codes
- Handle errors gracefully
- Add rate limiting for production
- Document request/response formats

❌ **DON'T:**
- Expose sensitive data in errors
- Return different errors for auth failures
- Skip input validation
- Use GET for mutations

---

## 👀 Code Review Process

### Before Requesting Review

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] No console.log or debugger statements
- [ ] Code is formatted (Prettier)
- [ ] No commented-out code
- [ ] Documentation updated
- [ ] CHANGELOG.md updated

### Reviewing Code

**Look for:**
- Code clarity and readability
- Proper error handling
- Type safety
- Performance implications
- Security vulnerabilities
- Test coverage

**Provide feedback that is:**
- Constructive
- Specific
- Actionable
- Respectful

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No new warnings
```

---

## 🚀 Quick Reference

### Daily Workflow

```bash
# Morning: Update main
git checkout main
git pull origin main

# Start feature
git checkout -b feature/my-feature

# Work
# ... make changes ...
git add .
git commit -m "feat: add new feature"

# Before lunch/EOD: Push
git push origin feature/my-feature

# Keep updated
git fetch origin
git rebase origin/main

# When done: Create PR
# Use GitHub UI to create Pull Request
```

### Common Tasks

```bash
# Start development server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build

# Run database migrations
npm run db:push

# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Run seed data
npx tsx prisma/seed.ts

# Test enrichment
npx tsx scripts/quick-test-enrichment.ts
```

---

## 📚 Resources

### Official Documentation
- [Next.js](https://nextjs.org/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [TailwindCSS](https://tailwindcss.com/docs)

### Best Practice Guides
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)

---

**Document Version:** 1.0
**Last Updated:** December 28, 2025
**Maintained By:** Development Team
