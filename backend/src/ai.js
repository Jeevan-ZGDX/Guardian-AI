function score(text) {
  const t = text.toLowerCase()
  let s = 0
  const k = [
    'urgent','immediately','harassment','security','theft','violence',
    'unsafe','abuse','threat','critical','data breach','fraud','bullying',
    'discrimination','fire','injury','privacy','leak','attack'
  ]
  for (const w of k) {
    if (t.includes(w)) s += 3
  }
  const neg = ['bad','terrible','awful','worse','worst','unsafe','angry','frustrated','pain','broken','illegal','unethical']
  for (const w of neg) {
    if (t.includes(w)) s += 1
  }
  const len = t.split(/\s+/).length
  if (len > 100) s += 2
  if (len > 200) s += 2
  return s
}

function classifySeverity(text) {
  const s = score(text)
  if (s >= 12) return 'critical'
  if (s >= 8) return 'high'
  if (s >= 4) return 'medium'
  return 'low'
}

module.exports = { classifySeverity }
