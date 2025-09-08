import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { walk } from 'oxc-walker'
import { walk as zimmerWalk } from 'zimmerframe'

const __filename = fileURLToPath(import.meta.url)

const ast = JSON.parse(readFileSync(
  join(__filename, '../svelte-compiler-3.15.0.json'),
  'utf-8',
))

function bench(name: string, fn: () => void) {
  const runs = []
  const ms = 1e6

  const start = process.hrtime.bigint()

  while (process.hrtime.bigint() - start < 1000 * ms) {
    const runStart = process.hrtime.bigint()
    fn()
    runs.push(process.hrtime.bigint() - runStart)
  }

  const total = runs.reduce((a, b) => a + b, BigInt(0))
  const avg = Number(total / BigInt(runs.length))

  console.log(`${name}: Average time over ${runs.length} runs: ${avg / 1e6}ms`)
}

bench('estree-walker', () => {
  let stack = 0
  walk(ast, {
    enter() { stack += 1 },
    leave() { stack -= 1 },
  })

  if (stack !== 0) {
    throw new Error('error walking')
  }
})

bench('zimmerframe', () => {
  let stack = 0
  zimmerWalk(ast, {}, {
    enter() { stack += 1 },
    leave() { stack -= 1 },
  })

  if (stack !== 0) {
    throw new Error('error walking')
  }
})
