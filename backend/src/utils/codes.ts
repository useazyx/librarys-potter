import { randomBytes } from 'node:crypto'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

// Sem 0/O e 1/I, que confundem na hora de ler o código em voz alta.
function randomCode(length: number): string {
  const bytes = randomBytes(length)
  let code = ''
  for (const byte of bytes) code += ALPHABET[byte % ALPHABET.length]
  return code
}

// Código do pedido, no formato LP-7K2M4P.
export function generateOrderCode(): string {
  return 'LP-' + randomCode(6)
}

// Código do chamado, no formato #A7K2M.
export function generateTicketCode(): string {
  return '#' + randomCode(5)
}
