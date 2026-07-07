'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import type { ActionResult } from '@/lib/admin/actions'

const VARIANT_BG: Record<string, string> = {
  primary: 'var(--brand-primary, #1B3F8A)',
  deploy: '#7C3AED',
  success: '#059669',
  danger: '#DC2626',
}

interface LifecycleActionProps {
  label: string
  pendingLabel: string
  variant?: keyof typeof VARIANT_BG
  /** Server action already bound to its proposal id. */
  action: () => Promise<ActionResult>
}

/**
 * One lifecycle button with real submit semantics: disabled while pending
 * (no double-deploys), inline error/success reporting from the action.
 */
export default function LifecycleAction({
  label,
  pendingLabel,
  variant = 'primary',
  action,
}: LifecycleActionProps) {
  const [result, formAction, pending] = useActionState<ActionResult | null>(
    async () => action(),
    null
  )

  return (
    <div className="flex flex-col items-end gap-1.5">
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: VARIANT_BG[variant],
            color: '#fff',
            border: 'none',
            cursor: pending ? 'not-allowed' : 'pointer',
            borderRadius: 'var(--radius-sm, 2px)',
          }}
        >
          {pending && <Loader2 size={12} className="animate-spin" />}
          {pending ? pendingLabel : label}
        </button>
      </form>
      {result && !result.ok && (
        <p
          role="alert"
          className="text-xs text-right max-w-[280px]"
          style={{ color: '#F87171', fontFamily: 'var(--font-mono, monospace)', wordBreak: 'break-word' }}
        >
          {result.error}
        </p>
      )}
      {result?.ok && result.message && (
        <p
          className="text-xs text-right max-w-[280px]"
          style={{ color: '#34D399', fontFamily: 'var(--font-mono, monospace)', wordBreak: 'break-word' }}
        >
          {result.message}
        </p>
      )}
    </div>
  )
}
