import { MantarayNode, RedundancyLevel } from '@ethersphere/bee-js'
import { ChunkSplitter, makeErasureBatch, makeIntermediateChunkHandler } from '@upcoming/swarm-core'
import { Binary, Optional } from 'cafe-utility'
import chalk from 'chalk'
import { readFileSync } from 'fs'
import { Argument, LeafCommand, Option } from 'furious-commander'
import { join } from 'path'
import { pickStamp } from '../../service/stamp'
import { readdirDeepAsync } from '../../utils'
import { BzzAddress } from '../../utils/bzz-address'
import { stampProperties } from '../../utils/option'
import { DEFAULT_REDUNDANCY_LEVEL, determineRedundancyLevel } from '../../utils/redundancy'
import { RootCommand } from '../root-command'

export class Sync extends RootCommand implements LeafCommand {
  public readonly name = 'sync'
  public readonly description = 'Sync a local folder to an existing manifest'

  @Argument({ key: 'address', description: 'Root manifest reference', required: true })
  public bzzUrl!: string

  @Argument({ key: 'folder', description: 'Local folder to be synced', required: true })
  public folder!: string

  @Option(stampProperties)
  public stamp!: string

  @Option({
    key: 'remove',
    type: 'boolean',
    description: 'Remove paths that do not exist locally',
  })
  public remove!: boolean

  @Option({
    key: 'redundancy',
    description: 'Redundancy of the upload (OFF, MEDIUM, STRONG, INSANE, PARANOID)',
  })
  public redundancy!: string

  private async expectedReference(data: Uint8Array, level: RedundancyLevel): Promise<Uint8Array> {
    const onBatch = makeErasureBatch(level, false, async () => {
      // no-op: only the resulting hash is needed here, nothing to persist
    })
    const splitter = new ChunkSplitter(onBatch, undefined, false, makeIntermediateChunkHandler(level))
    await splitter.append(data)
    const root = await splitter.finalize()

    return root.hash().toUint8Array()
  }

  public async run(): Promise<void> {
    super.init()

    if (!this.stamp) {
      this.stamp = await pickStamp(this.bee, this.console)
    }

    // Always sent explicitly, even when --redundancy is omitted: leaving this to the
    // node's own implicit default would make the comparison below only as reliable as
    // a guess about that node's behavior, which we've seen differ between Bee versions
    // (2.6.0 defaults to OFF, 2.8.1+ to MEDIUM). Fixing it here removes the ambiguity.
    const effectiveRedundancyResult = determineRedundancyLevel(this.redundancy)
    if (effectiveRedundancyResult.error !== undefined) {
      throw effectiveRedundancyResult.error
    }
    const effectiveRedundancyLevel = effectiveRedundancyResult.value ?? DEFAULT_REDUNDANCY_LEVEL
    const uploadOptions = { headers: { 'swarm-redundancy-level': String(effectiveRedundancyLevel) } }

    const address = new BzzAddress(this.bzzUrl)

    const node = await MantarayNode.unmarshal(this.bee, address.hash)
    await node.loadRecursively(this.bee)

    const map = new Map<string, MantarayNode>()
    const nodes = node.collect()
    for (const node of nodes) {
      map.set(node.fullPathString, node)
    }

    const files = await readdirDeepAsync(this.folder, this.folder)

    for (const file of files) {
      const existing = map.get(file)

      if (existing) {
        const localData = readFileSync(join(this.folder, file))
        const expected = await this.expectedReference(new Uint8Array(localData), effectiveRedundancyLevel)

        if (Binary.equals(expected, existing.targetAddress)) {
          this.console.log(chalk.gray(file) + ' ' + chalk.blue('UNCHANGED'))
        } else {
          const { reference } = await this.bee.uploadData(this.stamp, localData, undefined, uploadOptions)
          node.addFork(file, reference)
          this.console.log(chalk.gray(file) + ' ' + chalk.yellow('CHANGED'))
        }
      } else {
        const { reference } = await this.bee.uploadData(
          this.stamp,
          readFileSync(join(this.folder, file)),
          undefined,
          uploadOptions,
        )
        node.addFork(file, reference)
        this.console.log(chalk.gray(file) + ' ' + chalk.green('NEW'))
      }
    }

    if (this.remove) {
      for (const n of nodes) {
        if (!files.includes(n.fullPathString)) {
          node.removeFork(n.fullPathString)
          this.console.log(chalk.gray(n.fullPathString) + ' ' + chalk.red('REMOVED'))
        }
      }
    }

    const root = await node.saveRecursively(this.bee, this.stamp)
    this.console.log(root.reference.toHex())
    this.result = Optional.of(root.reference)
  }
}
