import supertest from 'supertest'
import app from './app'

const api = supertest.agent(app().callback())

test('GET /', async () => {
  const response = await api.get('/')
  expect(response.status).toBe(200)
  expect(response.body).toMatchObject({ status: 'OK' })
})
