import express from 'express'
import { Booking } from '@prisma/client'

import { ResponseType } from '~/lib/types'
import { jsonify } from '~/lib/utils'
import { getServices } from '~/services/services'
import { createBooking } from '~/services/bookings'
import { createBookingParamsSchema, isValidBooking } from '~/validators/booking'

export const bookingsRoute = express.Router()

bookingsRoute.get('/', async (req, res) => {
  const json = await getServices()
  res.send(jsonify(json))
})

bookingsRoute.post('/', async (req, res) => {
  createBookingParamsSchema.validate(req.body).then(async (params) => {
    let result: ResponseType = { ok: false, data: 0 }
    const bookings: any[] = params.details.map((info: any) => ({
      email: info.email,
      firstName: info.firstName,
      lastName: info.lastName,
      serviceId: params.serviceId,
      startTime: params.startTime,
      endTime: params.endTime
    }))

    const isValid = await isValidBooking(BigInt(params.serviceId), params.startTime, params.endTime)
    if (isValid) {
      const createdBookings = await createBooking(bookings)
      result.ok = createdBookings.count > 0
      result.data = createdBookings.count
    } else {
      result.error = "invalid booking"
    }

    res.send(jsonify(result))
  }).catch(error => {
    res.send(jsonify({
      ok: false,
      error: error
    }))
  })


  // const validate = isValidBooking(params)


})
