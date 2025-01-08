export const documentTemplates = {
  'Blog Post': `# Title

## Introduction

## Main Content

### Section 1

### Section 2

## Conclusion

---
*Tags:* 
*Date:* ${new Date().toLocaleDateString()}`,

  'Documentation': `# Project Name

## Overview

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

## API Reference

## Contributing

## License`,

  'Meeting Notes': `# Meeting Notes - ${new Date().toLocaleDateString()}

## Attendees

- 

## Agenda

1. 

## Discussion Points

## Action Items

- [ ] 
- [ ] 

## Next Steps`,

  'Task List': `# Project Tasks

## To Do
- [ ] Task 1
- [ ] Task 2

## In Progress
- [ ] Task 3

## Done
- [x] Task 4`
};

