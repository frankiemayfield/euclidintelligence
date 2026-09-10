/**
 * Remembers only the *most recently viewed* project per pillar so company-level
 * landing pages can offer a "continue" shortcut. This is a hint, never an
 * application-wide active-project lock: nothing reads it to scope a page.
 */
const key = (pillar: string) => `euclid-recent-project-${pillar}`;

export function recordRecentProject(pillar: string, projectId: string, tool?: string) {
  try {
    localStorage.setItem(key(pillar), JSON.stringify({ projectId, tool }));
  } catch {
    /* storage unavailable */
  }
}

export function getRecentProject(pillar: string): { projectId: string; tool?: string } | null {
  try {
    const raw = localStorage.getItem(key(pillar));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
