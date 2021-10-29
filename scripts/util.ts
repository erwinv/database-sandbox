export function now() {
  return parseInt(`${process.hrtime.bigint() / 1000000n}`, 10)
}

export function duration(start: number, precision = 3) {
  return ((now() - start) / 1000).toFixed(precision)
}

export function chunk(total: number, chunkSize: number) {
  const n = Math.floor(total / chunkSize)
  const r = total % chunkSize
  return [...new Array(n).fill(chunkSize), r]
}

export function pigeonhole(chunks: number[], n: number) {
  return chunks.reduce((acc, chunk, i) => {
    acc[i % n] += chunk
    return acc
  }, new Array(n).fill(0))
}
