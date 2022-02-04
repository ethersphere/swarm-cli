function specifyIdentityName(): string {
  return 'Enter a unique name for the new identity'
}

function identityNameConflict(name: string): string {
  return `An identity with the name '${name}' already exists`
}

function identityNameConflictArgument(name: string): string {
  return `${identityNameConflict(name)}. Provide a unique name in the first argument`
}

function identityNameConflictOption(name: string): string {
  return `${identityNameConflict(name)}. Provide a unique name with the --name option`
}

function noIdentity(): string {
  return "No identities found. Create one with the command 'identity create'"
}

function noSuchIdentity(name: string): string {
  return `No identity found with the name '${name}'`
}

function optionNotDefined(name: string, option?: string): string {
  return `No ${name} specified with the '--${option || name}' option`
}

function existingV3Password(): string {
  return 'Enter the current password of the V3 wallet'
}

function newV3Password(): string {
  return 'Enter a new password for the V3 wallet'
}

function newV3PasswordConfirmation(): string {
  return 'Enter the new password again for the V3 wallet'
}

function requireOptionConfirmation(option: string, message: string): string {
  return `${message}. Pass the --${option} option to allow it`
}

export const Message = {
  specifyIdentityName,
  identityNameConflict,
  identityNameConflictArgument,
  identityNameConflictOption,
  noIdentity,
  noSuchIdentity,
  optionNotDefined,
  existingV3Password,
  newV3Password,
  newV3PasswordConfirmation,
  requireOptionConfirmation,
}
