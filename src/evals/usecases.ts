/**
 * Use-case test suite — runs the eval against every shipped example config so
 * each advertised use case has a reproducible pass/fail, not a claim.
 *
 * `npm run eval:usecases` loops these, simulates callers against the real
 * brain, judges, and writes docs/usecases.md. Use OFFHOOK_EVAL_MODEL +
 * OFFHOOK_EVAL_PROVIDER to run every case on one capable model for comparable
 * scores (the judge needs to be capable); otherwise each config uses its own.
 */

import { localizePersonas, DEFAULT_PERSONAS, type Persona } from './personas.js';

export interface UseCase {
  id: string;
  /** Human-facing name for the report. */
  name: string;
  /** Path to the example agent.yaml. */
  config: string;
  /** Personas to run (defaults to the standard set). */
  personas: Persona[];
}

export const USE_CASES: UseCase[] = [
  {
    id: 'business-receptionist',
    name: 'Business receptionist (hours, FAQ, messages, transfer)',
    config: 'examples/business-receptionist/agent.yaml',
    personas: DEFAULT_PERSONAS,
  },
  {
    id: 'personal-secretary',
    name: 'Personal secretary (screen calls, take messages)',
    config: 'examples/personal-secretary/agent.yaml',
    personas: DEFAULT_PERSONAS,
  },
  {
    id: 'self-hosted',
    name: 'Data sovereignty (fully self-hosted config)',
    config: 'examples/self-hosted/agent.yaml',
    personas: DEFAULT_PERSONAS,
  },
  {
    id: 'multilingual-es',
    name: 'Multilingual — Spanish',
    config: 'examples/multilingual/agent.es.yaml',
    personas: localizePersonas(DEFAULT_PERSONAS, 'Spanish'),
  },
  {
    id: 'multilingual-hi',
    name: 'Multilingual — Hindi',
    config: 'examples/multilingual/agent.hi.yaml',
    personas: localizePersonas(DEFAULT_PERSONAS, 'Hindi'),
  },
  {
    id: 'multilingual-te',
    name: 'Multilingual — Telugu',
    config: 'examples/multilingual/agent.te.yaml',
    personas: localizePersonas(DEFAULT_PERSONAS, 'Telugu'),
  },
];
