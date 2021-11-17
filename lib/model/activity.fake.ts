import _ from 'lodash'
import faker from 'faker'

export function fakeActivity(override: Record<string, unknown> = {}) {
  _.defaults(override, {
    clientId: faker.random.word(),
    fid: faker.random.alphaNumeric(10),
    processName: faker.random.word(),
    udid: null,

    // Thai words available only in Faker Python
    // https://faker.readthedocs.io/en/master/locales/th_TH.html#faker-providers-lorem
    // No th locale in faker.js :(
    messageTh: faker.lorem.words(),

    messageEn: faker.lorem.words(),
    data: faker.datatype.json(),
    uuid: faker.datatype.uuid(),
    scheduleActivityId: null,
  })

  return override
}
