import logger from '../logger.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../../prisma/client.js'

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    }
  )
}

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
    }
  )
}

export const register = async (req, res) => {
  const { username, password, name } = req.body

  const existingUser =
    await prisma.user.findUnique({
      where: { username },
    })

  if (existingUser) {
    return res.status(409).json({
      error:
        'User with this username already exists',
    })
  }

  const hashedPassword =
    await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      name,
    },
  })

  const accessToken =
    generateAccessToken(user)

  const refreshToken =
    generateRefreshToken(user)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  })

  res.cookie(
    'refreshToken',
    refreshToken,
    {
      httpOnly: true,
    }
  )

  logger.info(
  `New user registered: ${user.username}`
  )

  res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
    },
    accessToken,
    refreshToken,
  })
}

export const login = async (req, res) => {
  const { username, password } = req.body

  const user =
    await prisma.user.findUnique({
      where: { username },
    })

  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
    })
  }

  const isMatch =
    await bcrypt.compare(
      password,
      user.password
    )

  if (!isMatch) {
    return res.status(401).json({
      error: 'Invalid credentials',
    })
  }

  await prisma.refreshToken.deleteMany({
    where: {
      userId: user.id,
    },
  })

  const accessToken =
    generateAccessToken(user)

  const refreshToken =
    generateRefreshToken(user)

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  })

  res.cookie(
    'refreshToken',
    refreshToken,
    {
      httpOnly: true,
    }
  )

  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
    },
    accessToken,
    refreshToken,
  })
}

export const me = async (req, res) => {
  const user =
    await prisma.user.findUniqueOrThrow({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true,
      },
    })

  res.json(user)
}

export const refresh = async (req, res) => {
  const oldRefreshToken =
    req.cookies.refreshToken ||
    req.body.refreshToken

  if (!oldRefreshToken) {
    return res.status(401).json({
      error: 'Refresh token required',
    })
  }

  try {
    const payload = jwt.verify(
      oldRefreshToken,
      process.env.JWT_REFRESH_SECRET
    )

    const storedToken =
      await prisma.refreshToken.findUnique({
        where: {
          token: oldRefreshToken,
        },
      })

    if (!storedToken) {
      return res.status(401).json({
        error: 'Invalid refresh token',
      })
    }

    await prisma.refreshToken.delete({
      where: {
        token: oldRefreshToken,
      },
    })

    const user =
      await prisma.user.findUniqueOrThrow({
        where: {
          id: payload.id,
        },
      })

    const accessToken =
      generateAccessToken(user)

    const refreshToken =
      generateRefreshToken(user)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    })

res.cookie(
  'refreshToken',
  refreshToken,
  {
    httpOnly: true,
  }
)

logger.info(
  `User login: ${user.username}`
)

res.json({
      accessToken,
      refreshToken,
    })
  } catch {
    res.status(401).json({
      error: 'Invalid refresh token',
    })
  }
}

export const logout = async (req, res) => {
  const refreshToken =
    req.cookies.refreshToken

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: {
        token: refreshToken,
      },
    })
  }

  res.clearCookie('refreshToken')

  res.json({
    message: 'Logged out successfully',
  })
}
