import { PrismaClient } from '@prisma/client'
import { time } from '~/lib/utils'
import { RecurringType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // services
  await prisma.service.createMany({
    data: [
      {
        id: 1,
        name: 'Men Haircut',
        duration: 10,
        maxSlot: 3,
        bufferTime: 5,
        allowedFutureDays: 7
      },
      {
        id: 2,
        name: 'Woman Haircut',
        duration: 60,
        maxSlot: 3,
        bufferTime: 10,
        allowedFutureDays: 7
      }
    ]
  })

  // availability types
  await prisma.availabilityType.createMany({
    data: [
      {
        id: 1,
        name: 'Open',
        isAvailable: true
      },
      {
        id: 2,
        name: 'Day Off',
        isAvailable: false
      },
      {
        id: 3,
        name: 'Holiday',
        isAvailable: false
      },
      {
        id: 4,
        name: 'Break Time',
        isAvailable: false
      }
    ]
  })

  // availabilities
  const startOfToday = time.utc().startOf('day')
  await prisma.availability.createMany({
    data: [
      // men haircut
      // monday to friday open
      {
        serviceId: 1,
        availabilityTypeId: 1,
        isRecurring: true,
        recurringType: RecurringType.weekday,
        startTime: startOfToday.subtract(startOfToday.day() - 1, 'day').add(8, 'hours').toDate(),
        endTime: startOfToday.subtract(startOfToday.day() - 1, 'day').add(20, 'hours').subtract(1, 'second').toDate()
      },
      // saturday open
      {
        serviceId: 1,
        availabilityTypeId: 1,
        isRecurring: true,
        recurringType: RecurringType.weekly,
        startTime: startOfToday.add(6 - startOfToday.day(), 'day').add(10, 'hours').toDate(),
        endTime: startOfToday.add(6 - startOfToday.day(), 'day').add(22, 'hours').subtract(1, 'second').toDate()
      },
      // daily lunch break
      {
        serviceId: 1,
        availabilityTypeId: 4,
        isRecurring: true,
        recurringType: RecurringType.daily,
        startTime: startOfToday.add(12, 'hours').toDate(),
        endTime: startOfToday.add(13, 'hours').subtract(1, 'second').toDate()
      },
      // daily cleaning break
      {
        serviceId: 1,
        availabilityTypeId: 4,
        isRecurring: true,
        recurringType: RecurringType.daily,
        startTime: startOfToday.add(15, 'hours').toDate(),
        endTime: startOfToday.add(16, 'hours').subtract(1, 'second').toDate()
      },
      // 3rd day from today is holiday
      {
        serviceId: 1,
        availabilityTypeId: 3,
        isRecurring: false,
        recurringType: null,
        startTime: startOfToday.add(3, 'days').toDate(),
        endTime: startOfToday.add(3, 'days').subtract(1, 'second').toDate()
      },

      // woman haircut
      // monday to friday open
      {
        serviceId: 2,
        availabilityTypeId: 1,
        isRecurring: true,
        recurringType: RecurringType.weekday,
        startTime: startOfToday.subtract(startOfToday.day() - 1, 'day').add(8, 'hours').toDate(),
        endTime: startOfToday.subtract(startOfToday.day() - 1, 'day').add(20, 'hours').subtract(1, 'second').toDate()
      },
      // saturday open
      {
        serviceId: 2,
        availabilityTypeId: 1,
        isRecurring: true,
        recurringType: RecurringType.weekly,
        startTime: startOfToday.add(6 - startOfToday.day(), 'day').add(10, 'hours').toDate(),
        endTime: startOfToday.add(6 - startOfToday.day(), 'day').add(22, 'hours').subtract(1, 'second').toDate()
      },
      // daily lunch break
      {
        serviceId: 2,
        availabilityTypeId: 4,
        isRecurring: true,
        recurringType: RecurringType.daily,
        startTime: startOfToday.add(12, 'hours').toDate(),
        endTime: startOfToday.add(13, 'hours').subtract(1, 'second').toDate()
      },
      // daily cleaning break
      {
        serviceId: 2,
        availabilityTypeId: 4,
        isRecurring: true,
        recurringType: RecurringType.daily,
        startTime: startOfToday.add(15, 'hours').toDate(),
        endTime: startOfToday.add(16, 'hours').subtract(1, 'second').toDate()
      },
      {
        serviceId: 2,
        availabilityTypeId: 3,
        isRecurring: false,
        recurringType: null,
        startTime: startOfToday.add(3, 'days').toDate(),
        endTime: startOfToday.add(3, 'days').subtract(1, 'second').toDate()
      },
    ]
  })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })