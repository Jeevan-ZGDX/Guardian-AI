const http = require('http')
const fs = require('fs')
const path = require('path')
const { classifySeverity } = require('./ai')
const { loadChain, addComplaintBlock } = require('./blockchain')

const dataDir = path.resolve(__dirname, '../data')
const complaintsPath = path.join(dataDir, 'complaints.json')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}
if (!fs.existsSync(complaintsPath)) {
  fs.writeFileSync(complaintsPath, JSON.stringify([]))
}
loadChain()

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        const json = body ? JSON.parse(body) : {}
        resolve(json)
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function getComplaints() {
  const raw = fs.readFileSync(complaintsPath, 'utf-8')
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveComplaints(list) {
  fs.writeFileSync(complaintsPath, JSON.stringify(list))
}

function uuid() {
  const bytes = require('crypto').randomBytes(16)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = bytes.toString('hex')
  return `${hex.substr(0,8)}-${hex.substr(8,4)}-${hex.substr(12,4)}-${hex.substr(16,4)}-${hex.substr(20)}`
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  if (req.method === 'GET' && url.pathname === '/') {
    return send(res, 200, { status: 'ok' })
  }
  if (req.method === 'GET' && url.pathname === '/complaints') {
    return send(res, 200, getComplaints())
  }
  if (req.method === 'GET' && url.pathname === '/chain') {
    return send(res, 200, loadChain())
  }
  if (req.method === 'POST' && url.pathname === '/complaints') {
    try {
      const body = await readJson(req)
      const title = typeof body.title === 'string' ? body.title.trim() : ''
      const description = typeof body.description === 'string' ? body.description.trim() : ''
      const reporter = typeof body.reporter === 'string' ? body.reporter.trim() : ''
      if (!title || !description) {
        return send(res, 400, { error: 'title and description required' })
      }
      const severity = classifySeverity(`${title} ${description}`)
      const c = {
        id: uuid(),
        title,
        description,
        reporter,
        severity,
        status: 'open',
        createdAt: new Date().toISOString()
      }
      const list = getComplaints()
      list.push(c)
      saveComplaints(list)
      addComplaintBlock(c)
      return send(res, 201, c)
    } catch (e) {
      return send(res, 400, { error: 'invalid json' })
    }
  }
  send(res, 404, { error: 'not found' })
})

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
server.listen(port)
