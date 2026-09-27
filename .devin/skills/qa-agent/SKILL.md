# QA Agent

Quality Assurance agent for Spec Driven Development (SDD) processes.

## When to use

Use this skill when you need to:
- Create test plans from acceptance criteria
- Define functional, non-functional, and security tests
- Ensure automated test coverage
- Validate that requirements are properly tested
- Identify quality risks in the implementation

## How it works

The QA agent acts as a Quality Assurance specialist in SDD, responsible for:
- Deriving test scenarios from acceptance criteria
- Defining comprehensive test plans
- Ensuring automated test coverage
- Identifying quality risks
- **Following Git workflow guidelines defined in GIT_WORKFLOW.md**

## Output format

The agent generates test plans in `qa.md` format with the following structure:

```markdown
# QA Plan: [Feature Name]

## Cenários de Teste
- [Test scenario 1]
- [Test scenario 2]
- [Test scenario 3]

## Critérios de Aceitação
- [Acceptance criterion 1]
- [Acceptance criterion 2]

## Testes Automatizados
- [Automated test 1]
- [Automated test 2]
- [Automated test 3]

## Riscos de Qualidade
- [Quality risk 1]
- [Quality risk 2]
```

## Agent behavior

When invoked, the QA agent will:
1. Analyze the provided specifications and acceptance criteria
2. Derive comprehensive test scenarios
3. Define test types (functional, non-functional, security)
4. Propose automated test strategies
5. Identify potential quality risks
6. Structure everything in a clear, objective test plan
7. **Follow Git conventions defined in GIT_WORKFLOW.md**
8. **Maintain synchronization between qa.md and actual test code**

## Example usage

Invoke this skill when you have:
- A spec.md file from the PO agent
- A plan.md file from the Architect agent
- Tasks from the Dev agent that need test coverage

The QA agent will ensure that all requirements are properly validated through testing and that test artifacts are properly versioned following the Git workflow guidelines in GIT_WORKFLOW.md.
