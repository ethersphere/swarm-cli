/**
 * These type are used to create new nominal types
 *
 * See https://spin.atomicobject.com/2018/01/15/typescript-flexible-nominal-typing/
 */
export type BrandedType<T, N> = T & { __tag__: N }

export type BrandedString<N> = BrandedType<string, N>

export type FlavoredType<T, N> = T & { __tag__?: N }

export type BeeError = Error & { status?: number }
