import { useState } from 'react'

export default function IssueForm() {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [hash, setHash] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('http://localhost:8000/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: desc, reporter: 'student' })
    })
    const data = await res.json()
    setHash(data.txHash || 'N/A')
    setLoading(false)
    setTitle('')
    setDesc('')
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Raise an Issue</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. Broken chair in classroom 301"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={4}
            placeholder="Describe the issue..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Issue'}
        </button>
        {hash && (
          <p className="text-sm text-green-700">✅ Issue recorded on-chain. Hash: {hash.slice(0, 16)}...</p>
        )}
      </form>
    </div>
  )
}