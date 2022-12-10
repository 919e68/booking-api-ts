import { Booking } from "@prisma/client"
import { prisma } from "~/lib/core"

export const createBooking = async (bookings: Booking[]) => {
  const created = await prisma.booking.createMany({
    data: bookings
  })

  return created
}