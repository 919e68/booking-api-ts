import { prisma } from "~/lib/core"
import { time } from '~/lib/utils'
import { getAvailableSlots } from "~/services/availability"
import { validator } from "~/lib/utils"

export const isValidBooking = async (serviceId: bigint, startTime: string, endTime: string) => {
  const slotStartTime = time(startTime)
  const slotEndTime = time(endTime)

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId
    }
  })

  const availabilities = await getAvailableSlots(service!)
  return !!availabilities.find(item => item.startTime.unix() === slotStartTime.unix() && item.endTime.unix() === slotEndTime.unix())
}

export const createBookingParamsSchema = validator.object().shape({
  serviceId: validator.string().required(),
  startTime: validator.string().required(),
  endTime: validator.string().required(),
  details: validator.array().of(
    validator.object().shape({
      email: validator.string().required(),
      firstName: validator.string().required(),
      lastName: validator.string().required(),
    })
  ).required()
});