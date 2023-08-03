export class Storage {
  private bytes: number

  constructor(bytes: number) {
    this.bytes = bytes
  }

  public getBytes(): number {
    return this.bytes
  }

  public getKilobytes(): number {
    return this.bytes / 1024
  }

  public getMegabytes(): number {
    return this.bytes / 1024 / 1024
  }

  public getGigabytes(): number {
    return this.bytes / 1024 / 1024 / 1024
  }

  public getTerabytes(): number {
    return this.bytes / 1024 / 1024 / 1024 / 1024
  }

  public toString(): string {
    if (this.bytes < 1024) {
      return `${this.bytes} B`
    }

    if (this.bytes < 1024 * 1024) {
      return `${this.getKilobytes().toFixed(2)} KB`
    }

    if (this.bytes < 1024 * 1024 * 1024) {
      return `${this.getMegabytes().toFixed(2)} MB`
    }

    if (this.bytes < 1024 * 1024 * 1024 * 1024) {
      return `${this.getGigabytes().toFixed(2)} GB`
    }

    return `${this.getTerabytes().toFixed(2)} TB`
  }
}
