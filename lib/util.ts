import _ from 'lodash'

export function getQueryValue(query: Partial<Record<string, string | string[]>>, name: string) {
  if (_.isNil(query[name])) return null

  return _.isArray(query[name])
    ? _.last(query[name]) as string
    : query[name] as string
}

export function getQueryFlag(query: Partial<Record<string, string | string[]>>, name: string, defaultValue = false) {
  const value = getQueryValue(query, name)

  if (_.isNil(value)) return defaultValue

  const affirmative = ['true', 'yes', '1']
  const negative = ['false', 'no', '0']

  return defaultValue === false
    ? affirmative.includes(value.trim().toLowerCase())
    : negative.includes(value.trim().toLowerCase())
}

export function getQueryNumber(query: Partial<Record<string, string | string[]>>, name: string, defaultValue = 0) {
  const value = getQueryValue(query, name)

  if (_.isNil(value)) return defaultValue

  return _.toNumber(value)
}
