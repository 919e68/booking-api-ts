import '~/config/env'
import express from 'express'

import { app as config } from '~/config'
import { bookingsRoute } from '~/routes'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/bookings', bookingsRoute)

app.listen(config.port, () => {
  console.info(`🚀🚀 server is running at http:://localhost:${config.port} 🚀🚀`)
})
