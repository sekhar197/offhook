import { describe, expect, it } from 'vitest';
import { parseMarkdownKnowledge, parseCatalogKnowledge, KnowledgeError } from './loader.js';

describe('parseMarkdownKnowledge', () => {
  const MD = `# Services

## Teeth Cleaning
Routine cleaning. Takes about 45 minutes.
Covered by most insurance plans.

## Whitening
In-office whitening, one hour.
`;

  it('turns ## headings into entries with the H1 as category', () => {
    const entries = parseMarkdownKnowledge(MD, 'services.md');
    expect(entries).toHaveLength(2);
    expect(entries[0].name).toBe('Teeth Cleaning');
    expect(entries[0].category).toBe('Services');
    expect(entries[0].description).toContain('45 minutes');
    expect(entries[0].id).toBe('services--teeth-cleaning');
  });

  it('falls back to the filename as category when no H1', () => {
    const entries = parseMarkdownKnowledge('## Parking\nLot behind the building.', 'visitor-info.md');
    expect(entries[0].category).toBe('Visitor Info');
  });

  it('returns empty for files with no headings', () => {
    expect(parseMarkdownKnowledge('just some prose', 'x.md')).toEqual([]);
  });
});

describe('parseCatalogKnowledge', () => {
  it('parses YAML arrays with defaults for id and category', () => {
    const yaml = `
- name: Conference Room A
  description: Seats 12, has a projector
- name: Hot Desk
  category: Workspaces
  metadata:
    dailyRate: 25
`;
    const entries = parseCatalogKnowledge(yaml, 'facilities.yaml');
    expect(entries[0].id).toBe('facilities--conference-room-a');
    expect(entries[0].category).toBe('Facilities');
    expect(entries[1].category).toBe('Workspaces');
    expect(entries[1].metadata?.dailyRate).toBe(25);
  });

  it('parses JSON too', () => {
    const entries = parseCatalogKnowledge('[{"name": "Item"}]', 'list.json');
    expect(entries[0].name).toBe('Item');
  });

  it('throws a readable error on invalid entries', () => {
    expect(() => parseCatalogKnowledge('- description: no name', 'bad.yaml'))
      .toThrow(KnowledgeError);
  });
});
