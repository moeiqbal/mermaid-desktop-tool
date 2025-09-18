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
[FEATURE_DESCRIPTION]
```
<!-- Example:
For the md and mermaid file parser, provide the ability to create a feature-rich HTML view of the md file with CSS styling. The mermaid diagrams need to be embedded in the markdown file as objects that keep the same functionality.
-->
```

#### Bug Fixes
[BUG_1_DESCRIPTION]
```
<!-- Example:
When opening the mermaid diagram in new tab or viewing it in the page, clicking on the "x" button to close and return to the main screen is not working. The "x" should close the tab entirely.
-->
```

[BUG_2_DESCRIPTION]
```
<!-- Example:
When running the yang explorer, some yang models have an error and don't render anything. Errors are happening silently. Need a dedicated error panel showing parse failure reasons.
-->
```

[BUG_3_DESCRIPTION]
```
<!-- Example:
The diagram export button in mermaid view does not work. The button should allow export to PNG/SVG (functionality exists but button is broken).
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