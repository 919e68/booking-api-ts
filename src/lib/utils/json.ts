import { serialize } from 'superjson'

export const jsonify = (object: any) => {
  const { json } = serialize(object)
  return json
}
