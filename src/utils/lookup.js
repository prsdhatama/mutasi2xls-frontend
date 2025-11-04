import rules from '@/data/category.json'

export function detectCategory (desc) {
  const d = desc.toLowerCase()

  for (const keyword in rules) {
    if (d.includes(keyword)) {
      return rules[keyword]
    }
  }

  return null
}
