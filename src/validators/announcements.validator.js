import { celebrate, Joi, Segments } from 'celebrate'

export const getAnnouncementsValidator = celebrate({
  [Segments.QUERY]: Joi.object({
    search: Joi.string().optional(),
    sort: Joi.string().valid('newest', 'oldest').optional(),
    page: Joi.number().integer().positive().optional(),
  }),
})

export const idValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
})

export const createAnnouncementValidator = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().positive().required(),
    category: Joi.string()
      .valid('sale', 'service', 'job', 'other')
      .required(),
    contactInfo: Joi.string().min(5).required(),
  }),
})

export const updateAnnouncementValidator = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(5).max(100),
    description: Joi.string().min(10),
    price: Joi.number().positive(),
    category: Joi.string().valid(
      'sale',
      'service',
      'job',
      'other'
    ),
    contactInfo: Joi.string().min(5),
  }).min(1),
})
