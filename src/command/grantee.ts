import { Argument, LeafCommand, Option } from "furious-commander";
import { RootCommand } from "./root-command";

export class Grantee extends RootCommand implements LeafCommand {
    public readonly name = 'grantee'
    public readonly description = 'Grantee managment'

    @Argument({
        key: 'path',
        description: 'Path to the file with grantee list',
        required: true,
        autocompletePath: true,
        conflicts: 'stdin',
      })
      public path!: string

    @Option({ key: 'stdin', type: 'boolean', description: 'Take data from standard input', conflicts: 'path' })
    public stdin!: boolean
    
    run(): void | Promise<void> {
        throw new Error("Method not implemented.");
    }
}