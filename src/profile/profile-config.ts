import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { ensureConfigFolderExists, getConfigFolderPath } from '../utils/config'

export type Profile = Record<string, Record<string, unknown>>

export class ProfileConfig {
  public active: string | null
  public profiles: Record<string, Profile>

  constructor() {
    const path = this.getConfigFilePath()

    if (!existsSync(path)) {
      this.active = null
      this.profiles = {}

      return this
    }
    const data = JSON.parse(readFileSync(path, 'utf-8'))
    this.profiles = data.profiles || {}
    this.active = data.active
  }

  public getActiveProfile(): Profile | null {
    if (this.active && this.profiles[this.active]) {
      return this.profiles[this.active]
    }

    return null
  }

  public get(name: string): Profile {
    this.ensureExistingProfile(name)

    return this.profiles[name]
  }

  public create(name: string): void {
    this.ensureNoExistingProfile(name)
    this.profiles[name] = {}
    this.persist()
  }

  public remove(name: string): void {
    this.ensureExistingProfile(name)
    delete this.profiles[name]
    this.persist()
  }

  public rename(oldName: string, newName: string): void {
    this.ensureExistingProfile(oldName)
    this.ensureNoExistingProfile(newName)
    this.profiles[newName] = this.profiles[oldName]
    delete this.profiles[oldName]
    this.persist()
  }

  public switch(name: string): void {
    this.ensureExistingProfile(name)
    this.active = name
    this.persist()
  }

  public disable(): void {
    this.active = null
    this.persist()
  }

  public set(name: string, command: string, key: string, value: string): void {
    this.ensureExistingProfile(name)

    if (!this.profiles[name][command]) {
      this.profiles[name][command] = {}
    }
    this.profiles[name][command][key] = value
    this.persist()
  }

  public unset(name: string, command: string, key: string): void {
    this.ensureExistingProfile(name)

    if (!this.profiles[name][command]) {
      return
    }
    delete this.profiles[name][command][key]

    if (!Object.keys(this.profiles[name][command]).length) {
      delete this.profiles[name][command]
    }
    this.persist()
  }

  private persist(): void {
    const path = this.getConfigFilePath()
    ensureConfigFolderExists('swarm-cli')
    writeFileSync(path, JSON.stringify({ active: this.active, profiles: this.profiles }, null, 4))
  }

  private ensureNoExistingProfile(name: string): void | never {
    if (this.profiles[name]) {
      this.throwExistsError(name)
    }
  }

  private ensureExistingProfile(name: string): void | never {
    if (!this.profiles[name]) {
      this.throwDoesNotExistError(name)
    }
  }

  private throwExistsError(name: string): never {
    throw Error(`Profile with name [${name}] already exists`)
  }

  private throwDoesNotExistError(name: string): never {
    throw Error(`Profile with name [${name}] does not exist`)
  }

  private getConfigFilePath(): string {
    return join(getConfigFolderPath('swarm-cli'), 'profiles.json')
  }
}
