# Feature Development Plan - Version 2.3.0

## Overview
This document outlines the implementation plan for two new features and one critical bug fix for the Mermaid Desktop Tool application. All features will include comprehensive testing and documentation.

---

## Feature 1: Dark Mode Toggle for Mermaid Diagrams
**Priority:** High
**Problem:** Users cannot see Mermaid diagrams clearly when dark mode is active, especially in full-screen view.
**Solution:** Implement a theme switcher with multiple color schemes for better visibility.

### Technical Requirements
- [ ] Add theme toggle control in diagram viewer
- [ ] Implement multiple color scheme options (light, dark, high-contrast, etc.)
- [ ] Ensure default view has light background
- [ ] Persist user theme preference in localStorage
- [ ] Apply theme to both normal and full-screen views

### Implementation Tasks

#### 1.1 Frontend Components
- [ ] Create `ThemeToggle.tsx` component with dropdown/toggle UI
- [ ] Add theme state management in `MermaidDiagram.tsx`
- [ ] Update `FullScreenDiagram.tsx` to include theme toggle
- [ ] Implement theme persistence logic

#### 1.2 Styling System
- [ ] Define theme configurations in `themes/mermaidThemes.ts`
  - Light theme (default)
  - Dark theme
  - High contrast theme
  - GitHub theme
  - Custom user-friendly themes
- [ ] Create CSS classes for each theme
- [ ] Implement Mermaid theme configuration updates

#### 1.3 Mermaid Integration
- [ ] Configure Mermaid.js theme API
- [ ] Update Mermaid initialization with theme support
- [ ] Handle dynamic theme switching without re-rendering

#### 1.4 UI/UX Enhancements
- [ ] Add theme preview in dropdown
- [ ] Implement smooth transitions between themes
- [ ] Add keyboard shortcuts for theme switching
- [ ] Show theme name in tooltip

---

## Feature 2: Real-time Mermaid Editor in YANG Viewer
**Priority:** High
**Reference:** Similar to https://mermaid.live/edit
**Goal:** Allow users to edit Mermaid diagrams and see real-time updates in YANG viewer.

### Technical Requirements
- [ ] Split-pane interface with editor and preview
- [ ] Real-time syntax validation
- [ ] Debounced live preview updates
- [ ] Syntax highlighting for Mermaid code
- [ ] Error handling with helpful messages

### Implementation Tasks

#### 2.1 Editor Component
- [ ] Create `MermaidEditor.tsx` with CodeMirror or Monaco integration
- [ ] Implement syntax highlighting for Mermaid syntax
- [ ] Add line numbers and code folding
- [ ] Include auto-completion support

#### 2.2 Layout Updates
- [ ] Modify `YangExplorer.tsx` to include editor mode
- [ ] Create `SplitPane` component for resizable panels
- [ ] Add toggle button to switch between view/edit modes
- [ ] Implement responsive layout for mobile devices

#### 2.3 Real-time Updates
- [ ] Implement debounced diagram updates (300ms delay)
- [ ] Add loading state during diagram rendering
- [ ] Handle parsing errors gracefully
- [ ] Show error messages in dedicated panel

#### 2.4 Features from mermaid.live
- [ ] Code formatting/beautification
- [ ] Export edited diagram (SVG, PNG, HTML)
- [ ] Save/load diagram from file
- [ ] Undo/redo functionality
- [ ] Copy diagram link/code

#### 2.5 Backend Integration
- [ ] Create `/api/yang/mermaid` endpoint for saving edits
- [ ] Implement validation endpoint
- [ ] Add diagram history/versioning support

---

## Bug Fix: HTML Export Style Dropdown Positioning
**Priority:** Critical
**Problem:** Style dropdown appears outside viewport, document scrolls horizontally.
**Solution:** Fix positioning and ensure content stays within main frame.

### Technical Requirements
- [ ] Fix dropdown positioning in main frame
- [ ] Eliminate horizontal scrolling
- [ ] Ensure responsive behavior on all screen sizes
- [ ] Maintain accessibility standards

### Implementation Tasks

#### 3.1 Component Fixes
- [ ] Update `HtmlExportModal.tsx` dropdown positioning
- [ ] Fix CSS overflow issues in export preview
- [ ] Adjust z-index for proper layering
- [ ] Implement proper flex/grid layout

#### 3.2 Style Corrections
- [ ] Update `htmlExport.ts` generated HTML structure
- [ ] Fix container width constraints
- [ ] Add max-width: 100vw to prevent overflow
- [ ] Test on various screen resolutions

#### 3.3 Testing
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Verify mobile responsive behavior
- [ ] Check print layout compatibility
- [ ] Validate exported HTML files

---

## QA Agent Implementation
**Purpose:** Automated testing and documentation validation system

### QA Agent Responsibilities

#### 4.1 Test Coverage
- [ ] Unit tests for all new components
- [ ] Integration tests for feature workflows
- [ ] E2E tests for critical user paths
- [ ] Visual regression tests for theme changes

#### 4.2 Test Implementation
```javascript
// Test structure for each feature
describe('Feature: Dark Mode Toggle', () => {
  test('Default theme is light', async () => {})
  test('Theme persists after reload', async () => {})
  test('All themes render correctly', async () => {})
  test('Theme toggle works in fullscreen', async () => {})
})

describe('Feature: Mermaid Editor', () => {
  test('Editor loads with syntax highlighting', async () => {})
  test('Real-time preview updates', async () => {})
  test('Error handling displays correctly', async () => {})
  test('Export functions work', async () => {})
})

describe('Bug Fix: HTML Export', () => {
  test('Dropdown stays within viewport', async () => {})
  test('No horizontal scrolling', async () => {})
  test('Responsive on mobile', async () => {})
})
```

#### 4.3 Documentation Validation
- [ ] Verify README.md is up-to-date
- [ ] Check API documentation completeness
- [ ] Validate CLAUDE.md instructions
- [ ] Update CHANGELOG.md

#### 4.4 Automated Checks
- [ ] Pre-commit hooks for linting
- [ ] Type checking before build
- [ ] Test execution in CI/CD
- [ ] Coverage reporting

---

## Implementation Timeline

### Phase 1: Setup and Planning (Day 1)
- [x] Create feature planning document
- [ ] Set up development branches
- [ ] Configure testing framework
- [ ] Review existing codebase

### Phase 2: Bug Fix Implementation (Day 2)
- [ ] Fix HTML export dropdown positioning
- [ ] Test across browsers
- [ ] Create unit tests
- [ ] Document fix in CHANGELOG

### Phase 3: Dark Mode Feature (Days 3-4)
- [ ] Implement theme system
- [ ] Create theme toggle component
- [ ] Integrate with Mermaid viewer
- [ ] Add theme persistence
- [ ] Write tests

### Phase 4: Mermaid Editor Feature (Days 5-7)
- [ ] Set up editor component
- [ ] Implement split-pane layout
- [ ] Add real-time preview
- [ ] Integrate with YANG viewer
- [ ] Create comprehensive tests

### Phase 5: QA and Documentation (Day 8)
- [ ] Run full test suite
- [ ] Update all documentation
- [ ] Performance testing
- [ ] Security review
- [ ] Accessibility audit

### Phase 6: Deployment (Day 9)
- [ ] Clean rebuild with no cache
- [ ] Docker image creation
- [ ] Deployment testing
- [ ] Smoke tests in production
- [ ] Monitor for issues

---

## Testing Checklist

### Unit Tests
- [ ] Theme toggle component
- [ ] Mermaid editor component
- [ ] Split pane layout
- [ ] HTML export modal
- [ ] Theme persistence utility
- [ ] Editor syntax validation

### Integration Tests
- [ ] Theme switching workflow
- [ ] Editor save/load workflow
- [ ] Export functionality
- [ ] YANG to Mermaid conversion
- [ ] Error handling flows

### E2E Tests
- [ ] Complete user journey: Upload → Edit → Export
- [ ] Theme persistence across sessions
- [ ] Multi-browser compatibility
- [ ] Mobile responsiveness
- [ ] Performance benchmarks

### Manual Testing
- [ ] Safari compatibility
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Print layout verification
- [ ] Network error handling

---

## Build and Deployment Process

### Clean Build Steps
```bash
# 1. Stop existing containers
docker-compose down

# 2. Clean Docker cache
docker system prune -af --volumes

# 3. Clean npm cache
cd frontend && npm cache clean --force
cd ../backend && npm cache clean --force

# 4. Remove node_modules
rm -rf frontend/node_modules backend/node_modules

# 5. Fresh install
cd frontend && npm install
cd ../backend && npm install

# 6. Run tests
cd frontend && npm run test
cd frontend && npm run typecheck
cd frontend && npm run lint

# 7. Build production image
docker-compose build --no-cache app

# 8. Start application
docker-compose up -d app

# 9. Verify health
curl http://localhost:3000/api/health
docker logs mermaid-yang-app

# 10. Run smoke tests
npm run test:e2e -- smoke-test
```

### Validation Steps
- [ ] Application starts without errors
- [ ] All API endpoints respond (check /api/docs)
- [ ] Frontend loads correctly
- [ ] File upload works
- [ ] Mermaid rendering functional
- [ ] YANG parsing operational
- [ ] Export features working
- [ ] New features accessible

---

## Success Criteria

### Feature 1: Dark Mode Toggle
✓ Users can switch between at least 4 different themes
✓ Default theme has light background
✓ Theme preference persists across sessions
✓ Themes work in both normal and fullscreen views
✓ No visual artifacts during theme switching

### Feature 2: Mermaid Editor
✓ Editor provides real-time preview
✓ Syntax highlighting works correctly
✓ Error messages are helpful and clear
✓ Export functionality matches mermaid.live
✓ Performance is smooth with large diagrams

### Bug Fix: HTML Export
✓ Style dropdown is always visible
✓ No horizontal scrolling occurs
✓ Layout is responsive on all devices
✓ Exported HTML renders correctly

### QA Agent
✓ 95%+ test coverage for new features
✓ All tests pass in CI/CD pipeline
✓ Documentation is complete and accurate
✓ No critical vulnerabilities found

---

## Risk Mitigation

### Potential Risks
1. **Mermaid v11 compatibility issues**
   - Mitigation: Test thoroughly, keep v10 fallback

2. **Performance degradation with real-time editing**
   - Mitigation: Implement debouncing, web workers

3. **Safari compatibility problems**
   - Mitigation: Progressive enhancement, feature detection

4. **Docker build failures**
   - Mitigation: Multi-stage builds, proper caching

5. **Theme switching causing flicker**
   - Mitigation: CSS transitions, requestAnimationFrame

---

## Documentation Updates Required

### Files to Update
- [ ] README.md - Add new feature descriptions
- [ ] CHANGELOG.md - Document all changes
- [ ] CLAUDE.md - Update development instructions
- [ ] API.md - Document new endpoints
- [ ] package.json - Update version to 2.3.0

### New Documentation
- [ ] THEMES.md - Theme customization guide
- [ ] EDITOR.md - Editor feature documentation
- [ ] TESTING.md - QA process documentation

---

## Post-Release Monitoring

### Metrics to Track
- Application start time
- Theme switching performance
- Editor responsiveness
- Export success rate
- Error rates by browser
- User feedback on new features

### Monitoring Tools
- Docker logs analysis
- Browser console monitoring
- Performance profiling
- User analytics
- Error tracking

---

## Notes

- Ensure backward compatibility with existing workflows
- Consider feature flags for gradual rollout
- Prepare rollback plan if issues arise
- Schedule release during low-traffic period
- Notify users of new features via changelog

---

*Last Updated: September 2025*
*Version: 2.3.0-planning*