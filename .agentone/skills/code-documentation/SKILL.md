---
name: code-documentation
description: Generate comprehensive documentation for code including docstrings, inline comments, README files, API documentation, and architecture overviews. Use when users want to document functions, classes, modules, or entire codebases. Triggers include requests like "document this code", "add docstrings", "create API docs", "write a README", "explain this codebase", or "generate technical documentation".
---

# Code Documentation

Generate clear, comprehensive documentation for code at any level—from individual functions to entire repositories.

## Documentation Workflow

1. **Analyze** - Read the code to understand its purpose and behavior
2. **Identify** - Determine what level of documentation is needed
3. **Generate** - Write documentation matching the code's language conventions
4. **Validate** - Ensure documentation accurately reflects the code

## Documentation Types

### Inline Documentation (Docstrings/Comments)

For functions, classes, and modules. See [references/docstring-formats.md](references/docstring-formats.md) for language-specific formats.

Key elements:
- Brief description of purpose
- Parameters with types and descriptions
- Return value description
- Exceptions/errors raised
- Usage example when helpful

### README Documentation

For project-level documentation. See [references/readme-template.md](references/readme-template.md) for structure.

Include:
- Project name and brief description
- Installation instructions
- Quick start / basic usage
- API reference or link to docs
- Contributing guidelines
- License

### API Documentation

For REST/GraphQL APIs:
- Endpoint URL and method
- Request parameters (path, query, body)
- Response format with examples
- Error codes and messages
- Authentication requirements

### Architecture Documentation

For system overviews:
- High-level component diagram
- Data flow between components
- Key design decisions and rationale
- External dependencies

## Best Practices

- **Be concise**: Explain what isn't obvious from the code itself
- **Use examples**: Show typical usage with realistic values
- **Document "why"**: Explain non-obvious design decisions
- **Keep updated**: Documentation should match current code behavior
- **Consistent style**: Follow the project's existing documentation conventions
