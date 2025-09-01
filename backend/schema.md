# Schema (MongoDB)

Collection: profiles (single-document design)

Document structure:
{
  name: string,
  email: string,
  education: [string],
  skills: [string],
  projects: [
    { title: string, description: string, links: [string], skills: [string] }
  ],
  work: [
    { company: string, role: string, startDate: string, endDate: string, description: string, skills: [string] }
  ],
  links: { github: string, linkedin: string, portfolio: string }
}

Indexes: single-doc design -> no indexes needed. For scale, add indexes on projects.skills and work.skills or refactor.
