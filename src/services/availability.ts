import { Availability, RecurringType, Service } from "@prisma/client"
import { prisma } from "~/lib/core"
import { logger, time } from '~/lib/utils'

export interface SlotType {
  timestamp?: Number
  startTime: time.Dayjs
  endTime: time.Dayjs
}

export const sortSlots = (slots: SlotType[]) => {
  return slots.sort((a: SlotType, b: SlotType) => (a.timestamp as any) - (b.timestamp as any)).map((slot: SlotType) => ({
    startTime: slot.startTime,
    endTime: slot.endTime
  }));
}

const getDailySlots = (service: Service, availability: Availability) => {
  const slots: SlotType[] = []

  const availabilityStartTime = time(availability.startTime)
  const availabilityEndTime = time(availability.endTime)

  const today = time.utc()
  for (let day = 1; day <= service.allowedFutureDays; day++) {
    const slot = today.add(day, 'day')

    const startTime = time(`${slot.format('YYYY-MM-DD')}T${availabilityStartTime.format('HH:mm:ssZ')}`)
    const endTime = time(`${slot.format('YYYY-MM-DD')}T${availabilityEndTime.format('HH:mm:ssZ')}`)

    // daily
    let currentTimeSlot = startTime
    while (endTime.diff(currentTimeSlot.add(service.duration, 'minutes').subtract(1, 'second')) >= 0) {
      slots.push({
        timestamp: currentTimeSlot.unix(),
        startTime: currentTimeSlot,
        endTime: currentTimeSlot.add(service.duration, 'minutes').subtract(1, 'second')
      })

      currentTimeSlot = currentTimeSlot.add(service.duration + service.bufferTime, 'minutes')
    }
  }

  return slots
}

const getWeekdaySlots = (service: Service, availability: Availability) => {
  const slots: SlotType[] = []

  const availabilityStartTime = time(availability.startTime)
  const availabilityEndTime = time(availability.endTime)

  const today = time.utc()
  for (let day = 1; day <= service.allowedFutureDays; day++) {
    const slot = today.add(day, 'day')

    const startTime = time(`${slot.format('YYYY-MM-DD')}T${availabilityStartTime.format('HH:mm:ssZ')}`)
    const endTime = time(`${slot.format('YYYY-MM-DD')}T${availabilityEndTime.format('HH:mm:ssZ')}`)

    // weekday
    if (slot.day() >= 1 && slot.day() <= 5) {
      let currentTimeSlot = startTime
      while (endTime.diff(currentTimeSlot.add(service.duration, 'minutes').subtract(1, 'second')) >= 0) {
        slots.push({
          timestamp: currentTimeSlot.unix(),
          startTime: currentTimeSlot,
          endTime: currentTimeSlot.add(service.duration, 'minutes').subtract(1, 'second')
        })

        currentTimeSlot = currentTimeSlot.add(service.duration + service.bufferTime, 'minutes')
      }
    }
  }

  return slots
}

const getWeeklySlots = (service: Service, availability: Availability) => {
  const slots: SlotType[] = []

  const availabilityStartTime = time(availability.startTime)
  const availabilityEndTime = time(availability.endTime)

  const today = time.utc()
  for (let day = 1; day <= service.allowedFutureDays; day++) {
    const slot = today.add(day, 'day')

    const startTime = time(`${slot.format('YYYY-MM-DD')}T${availabilityStartTime.format('HH:mm:ssZ')}`)
    const endTime = time(`${slot.format('YYYY-MM-DD')}T${availabilityEndTime.format('HH:mm:ssZ')}`)

    // weekly
    if (slot.day() == availabilityStartTime.day()) {
      let currentTimeSlot = startTime
      while (endTime.diff(currentTimeSlot.add(service.duration, 'minutes').subtract(1, 'second')) >= 0) {
        slots.push({
          timestamp: currentTimeSlot.unix(),
          startTime: currentTimeSlot,
          endTime: currentTimeSlot.add(service.duration, 'minutes').subtract(1, 'second')
        })

        currentTimeSlot = currentTimeSlot.add(service.duration + service.bufferTime, 'minutes')
      }
    }
  }

  return slots
}

export const getAvailableSlots = async (service: Service) => {
  let slots: SlotType[] = []

  const recurringAvailabilities = await prisma.availability.findMany({
    where: {
      serviceId: service.id,
      isRecurring: true,
      availabilityType: {
        isAvailable: true
      }
    },
  })

  recurringAvailabilities.forEach(availability => {
    if (availability.recurringType === RecurringType.daily) {
      slots = slots.concat(getDailySlots(service, availability))
    } else if (availability.recurringType === RecurringType.weekday) {
      slots = slots.concat(getWeekdaySlots(service, availability))
    } else if (availability.recurringType === RecurringType.weekly) {
      slots = slots.concat(getWeeklySlots(service, availability))
    }
  })

  const diabledSlots = await getDisabledSlots(service)
  const filteredSlots = slots.filter(slot => !inDisabledSlots(slot, diabledSlots))

  return sortSlots(filteredSlots)
}

const getDisabledDailySlots = (service: Service, availability: Availability) => {
  const slots: SlotType[] = []

  const availabilityStartTime = time(availability.startTime)
  const availabilityEndTime = time(availability.endTime)

  const today = time.utc()
  for (let day = 1; day <= service.allowedFutureDays; day++) {
    const slot = today.add(day, 'day')

    const startTime = time(`${slot.format('YYYY-MM-DD')}T${availabilityStartTime.format('HH:mm:ssZ')}`)
    const endTime = time(`${slot.format('YYYY-MM-DD')}T${availabilityEndTime.format('HH:mm:ssZ')}`)

    // daily
    slots.push({
      startTime,
      endTime
    })
  }

  return slots
}

const getDisabledWeekdaySlots = (service: Service, availability: Availability) => {
  const slots: SlotType[] = []

  const availabilityStartTime = time(availability.startTime)
  const availabilityEndTime = time(availability.endTime)

  const today = time.utc()
  for (let day = 1; day <= service.allowedFutureDays; day++) {
    const slot = today.add(day, 'day')

    const startTime = time(`${slot.format('YYYY-MM-DD')}T${availabilityStartTime.format('HH:mm:ssZ')}`)
    const endTime = time(`${slot.format('YYYY-MM-DD')}T${availabilityEndTime.format('HH:mm:ssZ')}`)

    // weekday
    if (slot.day() >= 1 && slot.day() <= 5) {
      slots.push({
        startTime,
        endTime
      })
    }
  }

  return slots
}

const getDisabledWeeklySlots = (service: Service, availability: Availability) => {
  const slots: SlotType[] = []

  const availabilityStartTime = time(availability.startTime)
  const availabilityEndTime = time(availability.endTime)

  const today = time.utc()
  for (let day = 1; day <= service.allowedFutureDays; day++) {
    const slot = today.add(day, 'day')

    const startTime = time(`${slot.format('YYYY-MM-DD')}T${availabilityStartTime.format('HH:mm:ssZ')}`)
    const endTime = time(`${slot.format('YYYY-MM-DD')}T${availabilityEndTime.format('HH:mm:ssZ')}`)

    // weekly
    if (slot.day() == availabilityStartTime.day()) {
      slots.push({
        startTime,
        endTime
      })
    }
  }

  return slots
}

const getRecurringDisabledSlots = (service: Service, availability: Availability) => {
  let slots: SlotType[] = []

  if (availability.recurringType === RecurringType.daily) {
    slots = slots.concat(getDisabledDailySlots(service, availability))
  } else if (availability.recurringType === RecurringType.weekday) {
    slots = slots.concat(getDisabledWeekdaySlots(service, availability))
  } else if (availability.recurringType === RecurringType.weekly) {
    slots = slots.concat(getDisabledWeeklySlots(service, availability))
  }

  return slots
}

const getBookingsDisabledSlots = async (service: Service) => {
  let slots: SlotType[] = []

  const today = time.utc()
  const serviceBookings = await prisma.booking.groupBy({
    by: ['serviceId', 'startTime', 'endTime'],
    _count: true,
    where: {
      AND: [
        {
          startTime: {
            gte: today.add(1, 'day').startOf('day').toDate(),
            lte: today.add(service.allowedFutureDays, 'days').endOf('day').toDate()
          }
        },
        {
          endTime: {
            gte: today.add(1, 'day').startOf('day').toDate(),
            lte: today.add(service.allowedFutureDays, 'days').endOf('day').toDate()
          }
        }
      ]
    }
  })

  const filteredServiceBookings = serviceBookings.filter(booking => {
    return booking._count == service.maxSlot
  })
  filteredServiceBookings.forEach(booking => {
    slots = slots.concat({
      startTime: time(booking.startTime),
      endTime: time(booking.endTime)
    })
  })

  return slots
}

export const getDisabledSlots = async (service: Service) => {
  let slots: SlotType[] = []

  // recurring
  const recurringDisabledAvailability = await prisma.availability.findMany({
    where: {
      serviceId: service.id,
      isRecurring: true,
      availabilityType: {
        isAvailable: false
      }
    }
  })
  recurringDisabledAvailability.forEach(availability => {
    slots = slots.concat(getRecurringDisabledSlots(service, availability))
  })

  // non recurring
  const nonRecurringDisabledAvailability = await prisma.availability.findMany({
    where: {
      serviceId: service.id,
      isRecurring: false,
      availabilityType: {
        isAvailable: false
      }
    }
  })
  nonRecurringDisabledAvailability.forEach(availability => {
    slots = slots.concat({
      startTime: time(availability.startTime),
      endTime: time(availability.endTime)
    })
  })

  // bookings
  const bookingsDisabledSlots = await getBookingsDisabledSlots(service)
  slots = slots.concat(bookingsDisabledSlots)

  return slots
}

export const inDisabledSlots = (slot: SlotType, disabledSlots: SlotType[]) => {
  let result = false

  for (let i = 0; i < disabledSlots.length; i++) {
    const disabledSlot = disabledSlots[i]

    const startTimeOverlaps = slot.startTime.unix() >= disabledSlot.startTime.unix() && slot.startTime.unix() <= disabledSlot.endTime.unix()
    const endTimeOverlaps = slot.endTime.unix() >= disabledSlot.startTime.unix() && slot.endTime.unix() <= disabledSlot.endTime.unix()

    if (startTimeOverlaps || endTimeOverlaps) {
      result = true
      break
    }
  }

  return result
}



