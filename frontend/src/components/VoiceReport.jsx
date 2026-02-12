import { useState, useRef } from 'react'

export default function VoiceReport({ issue, onClose }) {
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [report, setReport] = useState('')
  const mediaRef = useRef(null)

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    const chunks = []
    recorder.ondataavailable = e => chunks.push(e.data)
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      setAudioBlob(blob)
      upload(blob)
    }
    recorder.start()
    mediaRef.current = recorder
    setRecording(true)
  }

  const stop = () => {
    mediaRef.current.stop()
    setRecording(false)
  }

  const upload = async (blob) => {
    const fd = new FormData()
    fd.append('audio', blob, 'report.webm')
    fd.append('issue_id', issue.id)
    const res = await fetch('http://localhost:8000/api/report', {
      method: 'POST',
      body: fd
    })
    const data = await res.json()
    setReport(data.report)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded p-6 w-full max-w-xl">
        <h3 className="text-lg font-semibold mb-2">Voice Report for: {issue.title}</h3>
        <p className="text-sm text-gray-600 mb-4">Speak in your native language. AI will transcribe and summarize.</p>
        <div className="flex items-center gap-3 mb-4">
          {!recording ? (
            <button onClick={start} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Start Recording</button>
          ) : (
            <button onClick={stop} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Stop</button>
          )}
          <span className="text-sm text-gray-500">{recording ? 'Recording...' : audioBlob ? 'Processing...' : ''}</span>
        </div>
        {report && (
          <div className="bg-gray-50 rounded p-3 text-sm mb-4">
            <p className="font-medium mb-1">Generated Report</p>
            <p>{report}</p>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">Close</button>
        </div>
      </div>
    </div>
  )
}