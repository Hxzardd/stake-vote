'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { createProposal, type ActionResult } from '@/lib/admin/actions'

const inputStyle: React.CSSProperties = {
  background: '#18181B',
  border: '1px solid #27272A',
  color: '#FAFAFA',
  borderRadius: 'var(--radius-sm, 2px)',
}

/** Draft filing form with server-side validation surfaced per field. */
export default function CreateProposalForm() {
  const [result, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) =>
      createProposal(
        String(formData.get('title') ?? ''),
        String(formData.get('description') ?? ''),
        Number.parseInt(String(formData.get('quorum') ?? ''), 10)
      ),
    null
  )

  const fieldErrors = result && !result.ok ? (result.fieldErrors ?? {}) : {}

  return (
    <form action={formAction} className="space-y-2.5">
      <div>
        <input
          name="title"
          placeholder="Title"
          required
          aria-invalid={Boolean(fieldErrors.title)}
          className="w-full text-sm px-3 py-2 rounded outline-none transition-all"
          style={inputStyle}
        />
        <FieldError message={fieldErrors.title} />
      </div>
      <div>
        <textarea
          name="description"
          placeholder="Description"
          required
          rows={3}
          aria-invalid={Boolean(fieldErrors.description)}
          className="w-full text-sm px-3 py-2 rounded resize-none outline-none transition-all"
          style={inputStyle}
        />
        <FieldError message={fieldErrors.description} />
      </div>
      <div>
        <input
          name="quorum"
          type="number"
          placeholder="Quorum BPS (e.g. 4000)"
          defaultValue={4000}
          min={1}
          max={10000}
          required
          aria-invalid={Boolean(fieldErrors.quorumBps)}
          className="w-full text-sm px-3 py-2 rounded outline-none"
          style={{ ...inputStyle, fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}
        />
        <FieldError message={fieldErrors.quorumBps} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        style={{
          background: 'var(--brand-primary, #1B3F8A)',
          color: '#fff',
          border: 'none',
          cursor: pending ? 'not-allowed' : 'pointer',
          borderRadius: 'var(--radius-sm, 2px)',
        }}
      >
        {pending && <Loader2 size={13} className="animate-spin" />}
        {pending ? 'Filing…' : '+ File Draft'}
      </button>
      {result && !result.ok && Object.keys(fieldErrors).length === 0 && (
        <p role="alert" className="text-xs" style={{ color: '#F87171', fontFamily: 'var(--font-mono, monospace)' }}>
          {result.error}
        </p>
      )}
      {result?.ok && (
        <p className="text-xs" style={{ color: '#34D399', fontFamily: 'var(--font-mono, monospace)' }}>
          {result.message ?? 'Draft created'}
        </p>
      )}
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="text-xs mt-1" style={{ color: '#F87171' }}>
      {message}
    </p>
  )
}
