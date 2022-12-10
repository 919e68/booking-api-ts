import { prisma } from "~/lib/core"
import { getAvailableSlots } from '~/services/availability'

export const getServices =  async () => {
  const services = await prisma.service.findMany()

  const items = []
  for (let i = 0; i < services.length; i++) {
    const service = services[i]

    items.push({
      service,
      slots: await getAvailableSlots(service)
    })
  }

  return items
}