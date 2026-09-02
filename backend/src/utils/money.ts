import { Prisma } from '@prisma/client'

// O Decimal do Prisma não pode chegar no cliente como objeto.
export function toMoney(value: Prisma.Decimal | number | string): number {
  return Number(value)
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
