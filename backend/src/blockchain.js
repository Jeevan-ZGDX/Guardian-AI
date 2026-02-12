const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const dataDir = path.resolve(__dirname, '../data')
const chainPath = path.join(dataDir, 'chain.json')

function hash(s) {
  return crypto.createHash('sha256').update(s).digest('hex')
}

function loadChain() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(chainPath)) {
    const genesis = {
      index: 0,
      timestamp: Date.now(),
      previousHash: '0',
      data: 'genesis',
      hash: hash('0' + '0' + Date.now() + 'genesis')
    }
    fs.writeFileSync(chainPath, JSON.stringify([genesis]))
    return [genesis]
  }
  try {
    const raw = fs.readFileSync(chainPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    const empty = []
    fs.writeFileSync(chainPath, JSON.stringify(empty))
    return empty
  }
}

function saveChain(chain) {
  fs.writeFileSync(chainPath, JSON.stringify(chain))
}

function addComplaintBlock(complaint) {
  const chain = loadChain()
  const last = chain[chain.length - 1]
  const payload = JSON.stringify({
    complaintId: complaint.id,
    severity: complaint.severity,
    title: complaint.title
  })
  const index = last.index + 1
  const previousHash = last.hash
  const timestamp = Date.now()
  const h = hash(index + previousHash + timestamp + payload)
  const block = { index, timestamp, previousHash, data: payload, hash: h }
  chain.push(block)
  saveChain(chain)
  return block
}

module.exports = { loadChain, addComplaintBlock }
