/**
 * Contextual document intake.
 *
 * Files can enter Euclid from any workflow tool (bid packages today; cost inbox,
 * change orders and selections later). Whatever the intake point, the underlying
 * document always lands in the project's master document repository with the
 * business context that produced it.
 */
export type IntakeContext = "bid-packages" | "documents" | "cost-inbox" | "change-orders" | "selections";

export interface IntakeDocument {
  id: string;
  projectId: string;
  filename: string;
  context: IntakeContext;
  classification: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  meta?: Record<string, string | number>;
}

const KEY = "euclid-intake-documents";
const listeners = new Set<() => void>();
let cached: IntakeDocument[] | null = null;

function readAll(): IntakeDocument[] {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(KEY);
    cached = raw ? JSON.parse(raw) : [];
  } catch { cached = []; }
  return cached!;
}

export function subscribeIntake(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function listIntakeDocuments(projectId: string, context?: IntakeContext) {
  return readAll().filter(d => d.projectId === projectId && (!context || d.context === context));
}

export function addIntakeDocument(doc: Omit<IntakeDocument, "id" | "uploadedAt"> & { uploadedAt?: string }): IntakeDocument {
  const entry: IntakeDocument = {
    ...doc,
    id: `intake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    uploadedAt: doc.uploadedAt ?? new Date().toISOString(),
  };
  const next = [entry, ...readAll()];
  cached = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach(l => l());
  return entry;
}
