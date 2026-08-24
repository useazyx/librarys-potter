import { randomBytes } from 'node:crypto'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** Ambiguous glyphs (0/O, 1/I) are excluded so a code can be read out loud. */
function randomCode(length: number): string {
  const bytes = randomBytes(length)
  let code = ''
  for (const byte of bytes) code += ALPHABET[byte % ALPHABET.length]
  return code
}

/** Order number shown to the reader, e.g. LP-7K2M4P. */
export function generateOrderCode(): string {
  return 'LP-' + randomCode(6)
}

/** Support ticket number, e.g. #A7K2M. */
export function generateTicketCode(): string {
  return '#' + randomCode(5)
}
