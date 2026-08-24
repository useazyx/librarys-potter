import { prisma } from '../config/prisma.js'
import { BadRequestError, NotFoundError } from '../errors/index.js'

interface UpsertReviewInput {
  userId: string
  bookSlug: string
  rating: number
  comment?: string
}

export class UpsertReviewService {
  /**
   * A reader has one review per book: sending a second one edits the first,
   * which is what the star widget of the original site implied.
   */
  async execute({ userId, bookSlug, rating, comment }: UpsertReviewInput) {
    if (rating < 1 || rating > 5) throw new BadRequestError('A nota vai de 1 a 5 estrelas.')

    const book = await prisma.book.findUnique({ where: { slug: bookSlug } })

    if (!book) throw new NotFoundError('Livro')

    const review = await prisma.review.upsert({
      where: { bookId_userId: { bookId: book.id, userId } },
      create: { bookId: book.id, userId, rating, comment },
      update: { rating, comment },
      include: { user: { select: { id: true, name: true } } },
    })

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: review.user,
    }
  }
}

export class ListMyReviewsService {
  async execute(userId: string) {
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: { book: { select: { id: true, slug: true, title: true, coverUrl: true } } },
      orderBy: { updatedAt: 'desc' },
    })

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      book: review.book,
    }))
  }
}

export class DeleteReviewService {
  async execute(userId: string, reviewId: string) {
    const review = await prisma.review.findFirst({ where: { id: reviewId, userId } })

    if (!review) throw new NotFoundError('Avaliação')

    await prisma.review.delete({ where: { id: review.id } })

    return { success: true }
  }
}
