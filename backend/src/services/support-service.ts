import type { Prisma, TicketStatus, TicketUrgency } from '@prisma/client'
import { prisma } from '../config/prisma.js'
import { NotFoundError } from '../errors/index.js'
import { generateTicketCode } from '../utils/codes.js'

const TICKET_INCLUDE = {
  handledBy: { select: { id: true, name: true } },
} as const

type TicketRecord = Prisma.SupportTicketGetPayload<{ include: typeof TICKET_INCLUDE }>

function serializeTicket(ticket: TicketRecord) {
  return {
    id: ticket.id,
    code: ticket.code,
    name: ticket.name,
    email: ticket.email,
    subject: ticket.subject,
    description: ticket.description,
    urgency: ticket.urgency,
    status: ticket.status,
    resolution: ticket.resolution,
    handledBy: ticket.handledBy,
    resolvedAt: ticket.resolvedAt,
    createdAt: ticket.createdAt,
  }
}

interface CreateTicketInput {
  userId?: string
  name: string
  email: string
  subject: string
  description: string
  urgency: TicketUrgency
}

export class CreateTicketService {
  // Aberto para visitante, como era a página de relatar problema.
  async execute(input: CreateTicketInput) {
    const ticket = await prisma.supportTicket.create({
      data: { ...input, code: generateTicketCode() },
      include: TICKET_INCLUDE,
    })

    return serializeTicket(ticket)
  }
}

export class ListMyTicketsService {
  async execute(userId: string) {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      include: TICKET_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })

    return tickets.map(serializeTicket)
  }
}

interface ListTicketsInput {
  status?: TicketStatus
  urgency?: TicketUrgency
}

export class ListTicketsService {
  // Fila do suporte: abertos primeiro, depois por urgência, depois os mais antigos.
  async execute({ status, urgency }: ListTicketsInput) {
    const tickets = await prisma.supportTicket.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(urgency ? { urgency } : {}),
      },
      include: TICKET_INCLUDE,
      orderBy: { createdAt: 'asc' },
    })

    const statusWeight: Record<string, number> = { OPEN: 0, IN_PROGRESS: 1, RESOLVED: 2 }
    const urgencyWeight: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

    return tickets
      .map(serializeTicket)
      .sort(
        (a, b) =>
          statusWeight[a.status] - statusWeight[b.status] ||
          urgencyWeight[a.urgency] - urgencyWeight[b.urgency] ||
          a.createdAt.getTime() - b.createdAt.getTime(),
      )
  }
}

interface UpdateTicketInput {
  ticketId: string
  handledById: string
  status: TicketStatus
  resolution?: string
}

export class UpdateTicketService {
  async execute({ ticketId, handledById, status, resolution }: UpdateTicketInput) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })

    if (!ticket) throw new NotFoundError('Chamado')

    const updated = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status,
        resolution,
        handledById,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
      },
      include: TICKET_INCLUDE,
    })

    return serializeTicket(updated)
  }
}

export class SupportSummaryService {
  // Contadores do topo do painel de suporte.
  async execute() {
    const rows = await prisma.supportTicket.groupBy({ by: ['status'], _count: { status: true } })

    const byStatus = Object.fromEntries(rows.map((row) => [row.status, row._count.status]))

    return {
      open: byStatus.OPEN ?? 0,
      inProgress: byStatus.IN_PROGRESS ?? 0,
      resolved: byStatus.RESOLVED ?? 0,
      total: rows.reduce((sum, row) => sum + row._count.status, 0),
    }
  }
}
