---
trigger: always_on
description:
globs:
---
# Development Agent Workflow - Cursor Rules

## Primary Directive
You are a development agent implementing a project. Follow established documentation and maintain consistency.

## Core Workflow Process

### Before Starting Any Task
- Consult `/Docs/Implementation.md` for current stage and available tasks
- Check task dependencies and prerequisites
- Verify scope understanding

### Task Execution Protocol

#### 1. Task Assessment
- Read subtask from `/Docs/Implementation.md`
- Assess subtask complexity:
  - **Simple subtask:** Implement directly
  - **Complex subtask:** Create a todo list 


#### 3. Documentation Research
- Check `/Docs/Implementation.md` for relevant documentation links in the subtask
- Read and understand documentation before implementing

#### 4. UI/UX Implementation
- Consult `/Docs/UI_UX_doc.md` before implementing any UI/UX elements
- Follow design system specifications and responsive requirements

#### 5. Project Structure Compliance
- Check `/Docs/project_structure.md` before:
  - Running commands
  - Creating files/folders
  - Making structural changes
  - Adding dependencies

#### 6. Error Handling
- Check `/Docs/Bug_tracking.md` for similar issues before fixing
- Document all errors and solutions in Bug_tracking.md
- Include error details, root cause, and resolution steps

#### 7. Task Completion
Mark tasks complete only when:
- All functionality implemented correctly
- Code follows project structure guidelines
- UI/UX matches specifications (if applicable)
- No errors or warnings remain
- All task list items completed (if applicable)

### File Reference Priority
1. `/Docs/Bug_tracking.md` - Check for known issues first
2. `/Docs/Implementation.md` - Main task reference
3. `/Docs/project_structure.md` - Structure guidance
4. `/Docs/UI_UX_doc.md` - Design requirements

## Critical Rules
- **NEVER** skip documentation consultation
- **NEVER** mark tasks complete without proper testing
- **NEVER** ignore project structure guidelines
- **NEVER** implement UI without checking UI_UX_doc.md
- **NEVER** fix errors without checking Bug_tracking.md first
- **ALWAYS** document errors and solutions
- **ALWAYS** follow the established workflow process
- **ALWAYS** test functionality before presenting to user
- **NEVER** commit changes without user approval
- **NEVER** mark bugs as "Resolved" without user verification
- **NEVER** claim functionality is working without user confirmation
- **NEVER** proceed to git commit before user manually verifies implementation

## Testing & Approval Workflow
1. **Implementation**: Complete the feature/change
2. **Testing**: Test functionality manually in browser
3. **User Review**: Present changes to user for approval
4. **User Verification**: Wait for user to test and confirm functionality works
5. **Bug Status**: Only mark bugs as "Resolved" after user verification
6. **Approval**: Wait for user confirmation before proceeding
7. **Commit**: Only commit after user approval

## Bug Resolution Protocol
- **NEVER** mark bugs as "Resolved" in Bug_tracking.md without user verification
- **ALWAYS** wait for user to test and confirm the fix works
- **ALWAYS** update bug status to "In Progress" or "Pending User Verification" until confirmed
- **NEVER** claim "Testing Results" without actual user testing

Remember: Build a cohesive, well-documented, and maintainable project. Every decision should support overall project goals and maintain consistency with established patterns.# Development Agent Workflow - Cursor Rules

## Primary Directive
You are a development agent implementing a project. Follow established documentation and maintain consistency.

## Core Workflow Process

### Before Starting Any Task
- Consult `/Docs/Implementation.md` for current stage and available tasks
- Check task dependencies and prerequisites
- Verify scope understanding

### Task Execution Protocol

#### 1. Task Assessment
- Read subtask from `/Docs/Implementation.md`
- Assess subtask complexity:
  - **Simple subtask:** Implement directly
  - **Complex subtask:** Create a todo list 


#### 3. Documentation Research
- Check `/Docs/Implementation.md` for relevant documentation links in the subtask
- Read and understand documentation before implementing

#### 4. UI/UX Implementation
- Consult `/Docs/UI_UX_doc.md` before implementing any UI/UX elements
- Follow design system specifications and responsive requirements

#### 5. Project Structure Compliance
- Check `/Docs/project_structure.md` before:
  - Running commands
  - Creating files/folders
  - Making structural changes
  - Adding dependencies

#### 6. Error Handling
- Check `/Docs/Bug_tracking.md` for similar issues before fixing
- Document all errors and solutions in Bug_tracking.md
- Include error details, root cause, and resolution steps

#### 7. Task Completion
Mark tasks complete only when:
- All functionality implemented correctly
- Code follows project structure guidelines
- UI/UX matches specifications (if applicable)
- No errors or warnings remain
- All task list items completed (if applicable)

### File Reference Priority
1. `/Docs/Bug_tracking.md` - Check for known issues first
2. `/Docs/Implementation.md` - Main task reference
3. `/Docs/project_structure.md` - Structure guidance
4. `/Docs/UI_UX_doc.md` - Design requirements

## Critical Rules
- **NEVER** skip documentation consultation
- **NEVER** mark tasks complete without proper testing
- **NEVER** ignore project structure guidelines
- **NEVER** implement UI without checking UI_UX_doc.md
- **NEVER** fix errors without checking Bug_tracking.md first
- **ALWAYS** document errors and solutions
- **ALWAYS** follow the established workflow process

Remember: Build a cohesive, well-documented, and maintainable project. Every decision should support overall project goals and maintain consistency with established patterns.
