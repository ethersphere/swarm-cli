const BAR_SIZE = 40
const BAR_CHAR = '■'

export class ProgressBar {
  private total = 0
  private value = 0
  private startedAt = 0
  private active = false

  start(total: number, value: number): void {
    this.active = Boolean(process.stdout.isTTY)
    this.startedAt = Date.now()
    this.total = total
    this.update(value)
  }

  setTotal(total: number): void {
    this.total = total
  }

  update(value: number): void {
    this.value = value

    if (!this.active) {
      return
    }
    const ratio = this.total ? Math.min(this.value / this.total, 1) : 0
    const filled = Math.round(ratio * BAR_SIZE)
    const elapsed = (Date.now() - this.startedAt) / 1000
    const eta = ratio > 0 ? Math.round(elapsed / ratio - elapsed) : 0
    const bar = BAR_CHAR.repeat(filled) + ' '.repeat(BAR_SIZE - filled)
    process.stdout.write(
      `\r\x1b[2K ${bar}${BAR_CHAR} ${Math.round(ratio * 100)}% | ETA: ${eta}s | ${this.value}/${this.total}`,
    )
  }

  stop(): void {
    if (this.active) {
      process.stdout.write('\r\x1b[2K')
    }
    this.active = false
  }
}
