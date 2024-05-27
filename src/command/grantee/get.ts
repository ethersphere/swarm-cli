import { Argument, LeafCommand, Option } from "furious-commander";
import { GranteeCommand } from "./grantee-command";
import { stampProperties } from "../../utils/option";
const fs = require('fs');

export class Get extends GranteeCommand implements LeafCommand {
    public readonly name = 'get'
    public readonly description = 'Get grantee list'
    private actReqHeaders: Record<string, string> = {}

    @Argument({
        key: 'path',
        description: 'Path to the file with grantee list',
        required: true,
        autocompletePath: true,
        conflicts: 'stdin',
      })
      public path!: string

    public async run(): Promise<void> {
        await super.init()
    }
}