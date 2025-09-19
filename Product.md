# Claude Code Agent Prompt Template
## Project: Mermaid & YANG Visualization Tool

### Project Context
You are working on a Node.js application that provides a web-based interface for working with Mermaid diagrams, YANG models, and markdown linting. The application consists of:
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js with Express (ESM modules)
- **Containerization**: Docker for ARM64 (Apple Silicon)
- **Current State**: Application is functional with all basic features working

**Repository Structure**:
```
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   └── utils/
│   └── tests/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
├── docker/
├── docs/
└── uploads/
```

### Development Task

**Task Type**: [FEATURE/BUG_FIX/ENHANCEMENT/REFACTOR]

#### Feature Implementation
[FEATURE1_DESCRIPTION]
```
<!-- :
Feature: Safari Browser Compatibility Message
Description
Implement a browser detection system that displays a user-friendly "Safari Not Supported" message when users attempt to access the application using Safari (desktop or mobile). This avoids the significant development effort (3-4 weeks) required to fix the 79% test failure rate in Safari while maintaining a good user experience.
Implementation Requirements

Browser Detection: Detect Safari browser using user agent string matching
Full-Page Blocking Message: Display a centered, styled message that prevents access to the broken application
Alternative Browser Suggestions: Provide direct links to download Chrome, Firefox, and Edge
Professional Appearance: Use existing Tailwind classes to match application design
Early Detection: Check browser compatibility before attempting to load Mermaid.js or other incompatible components

Technical Details

Add BrowserCompatibilityCheck wrapper component at the App root level
Use regex pattern /^((?!chrome|android).)*safari/i.test(navigator.userAgent) for Safari detection
Prevent application initialization if Safari is detected
No additional dependencies required

User Message Content

Clear heading: "Browser Not Supported"
Explanation that the application requires features not compatible with Safari
List of recommended browsers with download links
Polite apology and mention that Safari support is on the roadmap
-->
```

[FEATURE2_DESCRIPTION]
```
<!--:
Feature: Multi-Architecture Docker Build Support
Description
Extend the Docker build configuration to support both ARM64 (Apple Silicon) and AMD64/x86-64 (Intel/AMD) architectures. Currently, the application only builds for ARM64, preventing deployment and usage on x86-64 based systems including most cloud providers, CI/CD pipelines, and Intel-based machines.
Implementation Requirements

Multi-Platform Build: Configure Docker buildx to create multi-architecture images
Architecture Targets: Support both linux/amd64 and linux/arm64 platforms
Build Configuration: Update Dockerfile and build scripts to handle cross-platform compilation
Base Image Compatibility: Ensure all base images support both architectures

Technical Details

Enable Docker buildx for multi-platform builds
Add --platform=linux/amd64,linux/arm64 to build commands
Update CI/CD pipeline to build and push multi-arch images
Verify all dependencies (Node.js, Python packages if any) are architecture-agnostic
Test image runs correctly on both architectures

Build Command Example
bashdocker buildx build --platform linux/amd64,linux/arm64 -t app:latest --push .
-->
```
[FEATURE3_DESCRIPTION]
```
<!--
Feature: Document View Tab - Full Markdown Preview with Inline Diagrams
Overview
Add a new "Document View" tab alongside the existing "Mermaid Viewer" and "YANG Explorer" tabs that renders the complete markdown file with inline mermaid diagrams in a formatted, readable view. This feature addresses the user need to review full documents (30% of usage) without leaving the application for VSCode or Obsidian, while preserving all existing Mermaid Viewer functionality.
Critical Requirements
⚠️ DO NOT modify any existing Mermaid Viewer functionality - users love the current diagram-focused features
⚠️ Maintain consistent UI/UX - use the same design system, colors, components, and interaction patterns as the existing application
⚠️ Preserve all current features - the new tab is additive only, no features should be removed or changed
Implementation Specifications
1. Tab Navigation

Add "Document View" as a new tab between "Mermaid Viewer" and "YANG Explorer"
Use identical tab styling and behavior as existing tabs
Maintain tab state when switching between views

2. Document View Layout

Main Content Area:

Render full markdown content with user-selected CSS theme (Tailwind/GitHub/Custom/Dark)
Display mermaid diagrams inline at their original positions in the document
Use the same container margins and padding as Mermaid Viewer


Sidebar Navigation (similar style to existing Diagram Navigator):

Collapsible table of contents showing:

Document headings (H1, H2, H3)
Diagram list with titles (e.g., "Diagram 1: vCMTS Cluster Physical Architecture")


Click to scroll to section/diagram
Highlight current visible section
Use same styling as current file browser sidebar



3. Diagram Interactions in Document View

On Hover: Display subtle overlay controls (same icons/style as Mermaid Viewer):

Zoom in/out buttons
Pan control
Export (SVG/PNG)
Fullscreen
"Open in Mermaid Viewer" link


On Click: Open diagram in modal/lightbox with full Mermaid Viewer controls
Maintain existing zoom/pan functionality from Mermaid Viewer

4. Theme Selector

Reuse the existing Export HTML theme selector component
Place theme selector in the top-right (similar position to Export HTML button)
Options: Tailwind CSS, GitHub Style, Custom Theme, Dark Mode toggle
Apply theme changes in real-time without page refresh

5. Cross-Tab Synchronization

Clicking "Open in Mermaid Viewer" on a diagram should:

Switch to Mermaid Viewer tab
Highlight/scroll to that specific diagram


Optional: Add breadcrumb showing "Viewing Diagram X of Y" when coming from Document View

6. Technical Considerations

Use the same markdown parsing library already in use
Reuse existing mermaid rendering components/logic
Share CSS theme definitions with Export HTML feature
Ensure diagram IDs are consistent between Document View and Mermaid Viewer
Maintain performance for large documents (lazy load diagrams if needed)

User Stories

As an architect, I want to review my complete documentation with embedded diagrams without switching to VSCode
As a user, I want to quickly switch between focused diagram work (75% of time) and document review (30% of time)
As a user, I want to see diagrams in their document context while retaining ability to interact with them

Success Criteria

 New Document View tab is visible and functional
 All existing Mermaid Viewer features remain unchanged
 Markdown renders with selected CSS theme
 Diagrams appear inline and are interactive
 Sidebar navigation works for headings and diagrams
 Can switch between Document View and Mermaid Viewer seamlessly
 UI consistency maintained throughout
 No performance degradation for existing features

Design Constraints

Match existing color scheme, fonts, and spacing
Use the same component library (Lucide icons, existing button styles)
Maintain current responsive breakpoints
Follow established interaction patterns (hover states, click behaviors)
Keep the same header height and layout structure

Note for Implementation
The goal is to enhance the application with document preview capabilities while preserving the excellent diagram-focused workflow that users currently love. Think of this as adding a "Preview" mode similar to VSCode's markdown preview, but with the rich diagram interactions users expect from this application.
-->
```
#### Bug Fixes
[BUG_1_DESCRIPTION]
```
<!-- Example
-->
```

[BUG_2_DESCRIPTION]
```
<!-- Example
-->
```

[BUG_3_DESCRIPTION]
```
<!-- Example
-->
```

### Implementation Requirements

#### Git Workflow
1. **FIRST ACTION**: Checkout a new branch called `develop` from the current branch
   ```bash
   git checkout -b develop
   ```

#### Code Changes Needed
**UI Changes**: [Leave blank if Claude should determine]
- Component modifications in `frontend/src/components/`
- View updates in `frontend/src/views/`
- Style adjustments using Tailwind CSS classes

**API Changes**: [Leave blank if Claude should determine]
- Route modifications in `backend/src/routes/`
- New endpoints or modifications to existing ones
- Error handling improvements

**Data/Parser Changes**: [Leave blank if Claude should determine]
- Parser logic updates
- Data structure modifications
- Library updates or replacements

#### Specific Technical Details

**Dependencies to Check/Update**:
- [ ] Check for yang-js library updates (current: v0.24.70)
- [ ] Verify mermaid.js compatibility (current: v11.4.1)
- [ ] Check other relevant package updates

**Known Issues to Address**:
- ESM/CommonJS compatibility (use pattern from `backend/src/routes/lint.js`)
- YANG models with complex structures may fail silently
- Export functionality event handlers may not be properly attached

**Files Likely to Need Modification**:
```
frontend/src/views/MermaidViewer.tsx     # Mermaid view functionality
frontend/src/components/MermaidDiagram.tsx # Diagram rendering/export
backend/src/routes/yang.js               # YANG parsing logic
backend/src/routes/files.js             # File management
frontend/src/views/YangExplorer.tsx     # YANG visualization
frontend/src/components/YangErrorPanel.tsx # New error panel (if needed)
```

### Testing Requirements

#### Test Implementation
1. **Update Existing Tests**: Add test cases to `frontend/tests/` directory
2. **Test Coverage Required**:
   - Unit tests for new functions/components
   - Integration tests for API changes
   - E2E tests for user workflows
   - Error scenario testing

#### Test Plan Structure
```markdown
## Test Results - [FEATURE/BUG_NAME]
Date: [DATE]
Total Tests: X
Passed: X
Failed: X

### Unit Tests
- [ ] [Component/Function] test
- [ ] Error handling test
- [ ] Edge case test

### Integration Tests
- [ ] API endpoint test
- [ ] File operation test
- [ ] Parser functionality test

### Manual Tests
- [ ] User workflow test
- [ ] Browser compatibility test
- [ ] Performance test

Issues Found: [LIST]
```

### Documentation Requirements

#### Scratchpad (scratchpad.md)
Write all key implementation notes, decisions, and thoughts including:
- Technical challenges encountered
- Design decisions made
- Performance considerations
- Alternative approaches considered
- Debugging notes
- Dependencies added/updated

#### Files to Update
- [ ] `docs/API.md` - If API changes are made
- [ ] `docs/FEATURE_TESTS.md` - Add new test cases
- [ ] `README.md` - If usage changes
- [ ] Component JSDoc comments

### Quality Checklist

Before considering the task complete, ensure:

#### Code Quality
- [ ] Self-documenting code with clear variable names
- [ ] JSDoc comments for new functions
- [ ] TypeScript types properly defined
- [ ] No ESLint errors or warnings
- [ ] Consistent code formatting

#### Error Handling
- [ ] All async operations have try-catch blocks
- [ ] User-friendly error messages
- [ ] Errors logged appropriately
- [ ] Graceful degradation for failures

#### Performance
- [ ] No memory leaks introduced
- [ ] Efficient DOM operations
- [ ] Debounced user inputs where appropriate
- [ ] Loading states for async operations

#### Testing
- [ ] All new code has tests
- [ ] Existing tests still pass
- [ ] Manual testing completed
- [ ] Cross-browser testing done

#### User Experience
- [ ] Loading indicators for async operations
- [ ] Clear success/error feedback
- [ ] Responsive design maintained
- [ ] Accessibility considerations

### Specific Instructions for Current Task

#### For Feature 1 (HTML Export):
- Generate standalone HTML file for download
- Support three CSS style options (settings tab):
  1. Tailwind styles (default)
  2. GitHub markdown styles
  3. Custom CSS matching dark/light theme
- Embed Mermaid diagrams as interactive objects
- Ensure diagrams maintain full functionality in exported HTML

#### For Bug Fixes:
1. **Close Button**: Ensure window.close() or tab close functionality works
2. **YANG Errors**: Create dedicated error panel component showing:
   - Parse error details
   - Line numbers where errors occurred
   - Error type and message
   - Stack trace (collapsible)
3. **Export Button**: Debug and fix event handler attachment for PNG/SVG export

### Success Criteria

The task is complete when:
- [ ] All specified features/bugs are resolved
- [ ] Code passes all tests (unit, integration, manual)
- [ ] No console errors in browser
- [ ] Documentation is updated
- [ ] Performance is acceptable (no degradation)
- [ ] Code is committed to `develop` branch with descriptive commit messages

### Additional Context

**Environment Variables**: Check `.env.development` for configuration
**Docker Commands**: Use `docker-compose up dev --build` for testing
**Known Working Endpoints**:
- GET /api/health
- GET/POST /api/files/*
- POST /api/yang/parse
- POST /api/lint/markdown

**Common Patterns in Codebase**:
- Toast notifications for user feedback
- Skeleton loading states
- Error boundaries for React components
- Axios interceptors for API calls

### Notes for Claude Code Agent

1. **Always start by checking out the develop branch**
2. **Read existing code patterns before implementing new features**
3. **Test incrementally - don't wait until the end**
4. **Use existing utility functions and components where possible**
5. **Follow the established TypeScript interfaces**
6. **Maintain consistency with existing UI/UX patterns**
7. **Write descriptive commit messages for each logical change**
8. **Update tests as you go, not after implementation**

### Questions to Consider Before Starting

1. Are there existing components/utilities that can be reused?
2. Will this change affect other parts of the application?
3. What error scenarios need to be handled?
4. How will this impact application performance?
5. Are there security implications to consider?
6. Does this require database or storage changes?
7. Will this work across all supported browsers?

---

**Remember**: The goal is to deliver functional, tested, and bug-free code. Take time to understand the existing codebase before making changes. When in doubt, follow existing patterns and conventions in the codebase.