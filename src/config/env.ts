import 'reflect-metadata'

import path from 'path'
import dotenv from 'dotenv'
import { expand } from 'dotenv-expand'

const env = dotenv.config({
  path: path.resolve('.env')
})

expand(env)
