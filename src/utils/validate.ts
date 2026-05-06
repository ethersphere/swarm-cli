import { Context } from 'madlad'

export function validateTokenAmount(value: unknown, context: Context): string[] {
  if (context.options.unit === 'bzz') {
    const amount = parseFloat(value as string)

    if (isNaN(amount) || amount <= 0) {
      return [`Invalid amount '${value}'. Amount must be a positive number.`]
    }
  } else {
    try {
      const amount = BigInt(value as string)

      if (amount <= BigInt(0)) {
        return [`Invalid amount '${value}'. Amount must be a positive integer.`]
      }
    } catch (e) {
      return [`Invalid amount '${value}'. Amount must be a positive integer.`]
    }
  }

  return []
}
