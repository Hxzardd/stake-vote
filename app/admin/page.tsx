import { getProposals, createProposal, runSnapshot, deployContract, startVoting, endVoting } from '@/lib/admin/actions'
import { revalidatePath } from 'next/cache'

export default async function AdminPage() {
  const proposals = await getProposals()

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Governance Admin Panel</h1>
      
      <div className="bg-slate-100 p-6 rounded-lg mb-8 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-semibold mb-4">Create New Proposal</h2>
        <form action={async (formData) => {
          'use server'
          const title = formData.get('title') as string
          const desc = formData.get('description') as string
          const quorum = parseInt(formData.get('quorum') as string)
          await createProposal(title, desc, quorum)
        }} className="space-y-4">
          <input name="title" placeholder="Proposal Title" className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" required />
          <textarea name="description" placeholder="Description" className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" required />
          <input name="quorum" type="number" placeholder="Quorum BPS (e.g., 4000 for 40%)" defaultValue={4000} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors">Create</button>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Existing Proposals</h2>
        {proposals.map((p: any) => (
          <div key={p.id} className="border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-sm bg-white dark:bg-slate-800 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <h3 className="font-bold text-xl">{p.title}</h3>
                
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300 font-mono">
                    Status: {p.status}
                  </span>
                  <span className="bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-blue-700 dark:text-blue-300">
                    Quorum: {p.quorum_bps / 100}%
                  </span>
                  <span className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">
                    Created: {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>

                {p.contract_address && (
                  <div className="mt-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-2 rounded inline-block">
                    Contract:{' '}
                    <a 
                      href={`https://amoy.polygonscan.com/address/${p.contract_address}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="font-mono underline hover:text-green-600"
                    >
                      {p.contract_address}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 shrink-0">
                {p.status === 'draft' && (
                  <form action={async () => { 'use server'; await runSnapshot(p.id) }}>
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded font-medium shadow-sm hover:bg-yellow-600 transition-colors">1. Run Snapshot</button>
                  </form>
                )}
                {p.status === 'snapshot_taken' && (
                  <form action={async () => { 'use server'; await deployContract(p.id) }}>
                    <button className="bg-purple-500 text-white px-4 py-2 rounded font-medium shadow-sm hover:bg-purple-600 transition-colors">2. Deploy Contract</button>
                  </form>
                )}
                {p.status === 'deployed' && (
                  <form action={async () => { 'use server'; await startVoting(p.id) }}>
                    <button className="bg-green-500 text-white px-4 py-2 rounded font-medium shadow-sm hover:bg-green-600 transition-colors">3. Start Voting</button>
                  </form>
                )}
                {p.status === 'voting' && (
                  <form action={async () => { 'use server'; await endVoting(p.id) }}>
                    <button className="bg-red-500 text-white px-4 py-2 rounded font-medium shadow-sm hover:bg-red-600 transition-colors">4. End Voting</button>
                  </form>
                )}
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
              {p.description}
            </p>
          </div>
        ))}
        {proposals.length === 0 && <p className="text-slate-500 text-center py-8">No proposals found in the database.</p>}
      </div>
    </div>
  )
}
