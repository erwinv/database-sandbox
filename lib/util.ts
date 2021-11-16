import _ from 'lodash'

type Query = Partial<Record<string, string | string[]>>

export function getQueryValue(query: Query, name: string) {
  if (_.isNil(query[name])) return null

  return _.isArray(query[name])
    ? _.last(query[name]) as string
    : query[name] as string
}

export function getQueryFlag(query: Query, name: string, defaultValue = false) {
  const value = getQueryValue(query, name)

  if (_.isNil(value)) return defaultValue

  const affirmative = ['true', 'yes', '1']
  const negative = ['false', 'no', '0']

  return defaultValue === false
    ? affirmative.includes(value.trim().toLowerCase())
    : negative.includes(value.trim().toLowerCase())
}

export function getQueryNumber(query: Query, name: string, defaultValue = 0) {
  const value = getQueryValue(query, name)

  if (_.isNil(value)) return defaultValue

  return _.toNumber(value)
}

export function nullable(jsonSchema: Record<string, unknown>) {
  return {
    anyOf: [
      { type: 'null' },
      jsonSchema
    ]
  }
}