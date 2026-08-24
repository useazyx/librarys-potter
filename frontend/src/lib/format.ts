const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const longDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
const shortDateTime = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatPrice = (value: number) => currency.format(value)
export const formatDate = (value: string | Date) => longDate.format(new Date(value))
export const formatDateTime = (value: string | Date) => shortDateTime.format(new Date(value))

export const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Leitor',
  SUPPLIER: 'Fornecedor',
  SUPPORT: 'Suporte',
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Aguardando pagamento',
  PAID: 'Pagamento confirmado',
  SHIPPED: 'A caminho',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
}

export const TICKET_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em atendimento',
  RESOLVED: 'Resolvido',
}

export const URGENCY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
}
