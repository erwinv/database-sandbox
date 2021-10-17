import yaml from 'js-yaml'
import env from '../lib/env'

console.info(yaml.dump(env, {
  replacer: (_, v) => v instanceof URL ? v.toString() : v
}))
