/**
 * Stress: hybrid search against a large knowledge base. Most deployments have
 * tens of entries; this proves the search stays correct and bounded at 10k —
 * it finds a needle, returns a bounded result set (not the whole catalogue),
 * and completes well under a turn budget. Account-free (BM25 path, no
 * embeddings). The measured ceiling is asserted, not assumed — no silent caps.
 */
import { describe, expect, it } from 'vitest';
import { hybridSearch } from '../../src/search/hybrid-search.js';
import { EMPTY_VOCABULARY, type KnowledgeEntry } from '../../src/types.js';

const SIZE = 10_000;
const CATEGORIES = ['Massage', 'Therapy', 'Classes', 'Treatment', 'Consult'];

function bigCatalogue(): KnowledgeEntry[] {
  const entries: KnowledgeEntry[] = Array.from({ length: SIZE }, (_, i) => ({
    id: `e${i}`,
    name: `Service ${i} ${CATEGORIES[i % CATEGORIES.length]} option`,
    category: CATEGORIES[i % CATEGORIES.length],
  }));
  // a distinctive needle
  entries[7777] = { id: 'needle', name: 'Quantum Zither Restoration', category: 'Specialty' };
  return entries;
}

describe('hybrid search — 10k-entry scale', () => {
  const entries = bigCatalogue();

  it('finds a distinctive entry in a 10k catalogue, fast and bounded', async () => {
    const start = Date.now();
    const results = await hybridSearch('quantum zither', entries, [], { vocabulary: EMPTY_VOCABULARY });
    const elapsed = Date.now() - start;

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.item.id).toBe('needle');           // the needle ranks first
    expect(results.length).toBeLessThan(100);             // a bounded set, not the whole catalogue
    expect(elapsed, `search took ${elapsed}ms`).toBeLessThan(3000);
  });

  it('a generic query stays bounded (no pathological blowup)', async () => {
    const results = await hybridSearch('service option', entries, [], { vocabulary: EMPTY_VOCABULARY });
    expect(results.length).toBeLessThan(200); // never returns thousands
  });
});
