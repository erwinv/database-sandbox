import koa from 'koa'

export function ping(): koa.Middleware {
  return async (ctx) => {
    ctx.body = 'pong'
  }
}

export function info(): koa.Middleware {
  return async (ctx) => {
    ctx.body = {
      platform: process.platform,
      release: process.release,
      versions: process.versions,
      uptime: process.uptime(),
      cpu: process.cpuUsage(),
      mem: process.memoryUsage(),
    }
  }
}
