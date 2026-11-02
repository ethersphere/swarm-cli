# AGENTS.md

`@ethersphere/swarm-cli` — a TypeScript CLI for managing a Bee node and interacting with the Swarm network. Built on
`@ethersphere/bee-js` (API client) and `furious-commander` (decorator-based command framework).

## Commands

```sh
npm start -- <args>        # run from source via ts-node, e.g. npm start -- stake status
npm run build              # rimraf dist && tsc
npm run check              # type-check src + test (tsconfig.test.json)
npm run lint               # eslint --fix + prettier --write
npm run lint:check         # what CI runs
npm test                   # jest integration tests (needs running Bee nodes, see Testing)
npx jest --config=jest.config.ts test/command/stake.spec.ts   # single spec
```

CI (`.github/workflows/check.yaml`) runs commitlint, `lint:check`, `check`, `build`. Commits follow Conventional
Commits.

## Layout

- `src/index.ts` — entry; calls `cli()` from furious-commander.
- `src/config.ts` — global options (`--bee-api-url`, `--quiet`, `--verbose`, `--yes`, `--curl`, `--header`, …) and
  `rootCommandClasses` (registers every top-level command).
- `src/command/<group>/` — one folder per command group (`stake`, `stamp`, `feed`, `identity`, `manifest`, `access`,
  `cheque`, `pinning`, `pss`, `wallet`, `history`, `utility`). `index.ts` is a `GroupCommand` listing
  `subCommandClasses`; each subcommand is its own file. Top-level leaf commands (`upload`, `download`, `status`,
  `quickstart`, …) live directly in `src/command/`.
- `src/command/root-command/` — `RootCommand` base class (`index.ts`), `CommandLog` verbosity-aware logger
  (`command-log.ts`), config file handling (`command-config.ts`).
- `src/service/` — non-command logic: `identity`, `stamp`, `history` (upload history), `access`, `version_checker`.
- `src/utils/` — validation, text formatting, spinner, errors, rpc/contracts, etc.
- `test/` — jest specs; `test/utility/index.ts` has the test harness; `test/testconfig/` holds per-suite config files.

## Writing a command

```ts
export class Foo extends RootCommand implements LeafCommand {
  public readonly name = 'foo'
  public readonly description = '...'

  @Argument({ key: 'amount', type: 'decimal-string', required: true })
  public amount!: string

  @Option({ key: 'unit', type: 'enum', enum: ['bzz', 'plur'], default: 'bzz' })
  public unit!: string

  public async run(): Promise<void> {
    super.init() // must be called first: sets this.bee, this.console, this.commandConfig
    ...
  }
}
```

Then add it to the group's `subCommandClasses` (or `rootCommandClasses` in `src/config.ts`).

Conventions:

- Use `this.bee` (bee-js `Bee` instance) for all node calls, e.g. `this.bee.stake.get()`, `this.bee.stamp.get(id)`.
- Output via `this.console` (`log`, `info`, `dim`, `verbose`, `quiet`, `error`), never `console.log` directly — it
  respects `--quiet`/`--verbose`.
- Prompts: `this.console.confirm(...)` / `promptList` etc. Skip prompts when `this.yes` or `this.quiet`; in quiet mode
  throw instead of prompting.
- Use `createSpinner` from `src/utils/spinner` for long operations, only when not quiet and not `--curl`.
- Token amounts use bee-js `BZZ` / `DAI` classes (`BZZ.fromDecimalString`, `BZZ.fromPLUR`, `.lt`, `.toDecimalString`).
- `--bee-api-url` can also come from the config file (`~/.swarm-cli/config.json`, overridable by
  `SWARM_CLI_CONFIG_FOLDER`/`SWARM_CLI_CONFIG_FILE`) or `BEE_API_URL`.

## Code style

- Prettier: 120 cols, no semicolons, single quotes, trailing commas, `arrowParens: avoid`.
- Very strict tsconfig (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, …).
- **Strict rule: no comments.** Write code that is easy to read on its own (clear names, small well-named functions)
  instead of explaining unclear code with comments. If a comment is truly unavoidable, keep it to one short line. No
  block comments, no JSDoc paragraphs, no comments restating what the code does.

## Testing

**Every functionality must be covered by tests.** New commands, options, and behavior changes (including error paths)
ship with tests in the same change.

Tests are integration tests against real Bee nodes; there are no mocks of the Bee API. The jest global setup
(`jest.config.ts`) waits for 5 Bee nodes on ports 1633, 1635, … 1641 and asserts their chequebook balances, so a local
stack is required:

- `bee-factory start --tag <bee version>` — queen + workers on 1633/1635/…
- `bee-dev --port 16337` and `bee-dev --port 16338 --no-swap` — used by some specs (`getBeeDevOption()` in
  `test/utility/stamp.ts`, e.g. the stake tests).

Useful env vars: `SKIP_WORKER` (single queen only), `TEST_STAMP` (reuse a stamp), `SKIP_COVERAGE=true`, `DEBUG`
(print captured console output).

Specs use `describeCommand(name, ({ consoleMessages, getLastMessage, hasMessageContaining }) => …)` and
`invokeTestCli([...argv])`; output is captured into `consoleMessages`, and `process.exit` is mocked to throw. The
custom matcher `toMatchLinesInOrder` (`test/custom-matcher.ts`) asserts ordered output lines.

Tests that exercise user prompts must go in a separate file under `test/prompt/`, named `<command>-prompt.spec.ts`
(e.g. `test/prompt/stamp-prompt.spec.ts`), never in the regular `test/command/` spec. E2E tests
(`test/e2e/`) run with `npm run test.e2e`.
