import logger from '../logger.js'
import prisma from '../../prisma/client.js'
import fs from 'fs/promises'
import cloudinary from '../cloudinary.js'

export const getAnnouncements = async (req, res) => {
  const { search = '', sort = 'newest', page = 1 } = req.query

  const pageNum = Number(page)
  const perPage = 10

  const where = {}

  if (search) {
    where.title = {
      contains: search,
    }
  }

  const orderBy = {
    createdAt: sort === 'oldest' ? 'asc' : 'desc',
  }

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy,
      skip: (pageNum - 1) * perPage,
      take: perPage,
    }),
    prisma.announcement.count({ where }),
  ])

  res.json({
    data: announcements,
    pagination: {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / perPage),
      perPage,
    },
  })
}

export const getAnnouncementById = async (req, res) => {
  const announcement =
    await prisma.announcement.findUniqueOrThrow({
      where: {
        id: Number(req.params.id),
      },
    })

  res.json(announcement)
}

export const createAnnouncement = async (req, res) => {
  let imageUrl = null

  if (req.file) {
    const result =
      await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: 'announcements',
        }
      )

    imageUrl = result.secure_url

    await fs.unlink(req.file.path)

    logger.info(
      `Photo uploaded: ${imageUrl}`
    )
  }

  const announcement =
    await prisma.announcement.create({
      data: {
        ...req.body,
        imageUrl,
        userId: req.user.id,
      },
    })

  logger.info(
    `Announcement created: ${announcement.id}`
  )

  res.status(201).json(announcement)
}

export const updateAnnouncement = async (req, res) => {
  const announcement =
    await prisma.announcement.findUniqueOrThrow({
      where: {
        id: Number(req.params.id),
      },
    })

  if (announcement.userId !== req.user.id) {
    return res.status(403).json({
      error: 'Access denied',
    })
  }

  let imageUrl = announcement.imageUrl

  if (req.file) {
    const result =
      await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: 'announcements',
        }
      )

    imageUrl = result.secure_url

    await fs.unlink(req.file.path)

    logger.info(
      `Photo updated: ${imageUrl}`
    )
  }

  const updatedAnnouncement =
    await prisma.announcement.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        ...req.body,
        imageUrl,
      },
    })

  res.json(updatedAnnouncement)
}

export const deleteAnnouncement = async (req, res) => {
  const announcement =
    await prisma.announcement.findUniqueOrThrow({
      where: {
        id: Number(req.params.id),
      },
    })

  if (announcement.userId !== req.user.id) {
    return res.status(403).json({
      error: 'Access denied',
    })
  }

  await prisma.announcement.delete({
    where: {
      id: Number(req.params.id),
    },
  })

  logger.info(
    `Announcement deleted: ${announcement.id}`
  )

  res.status(204).end()
}
