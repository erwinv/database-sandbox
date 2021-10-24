import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 10 },
    { duration: '20s', target: 0 },
  ],
}

export default function () {
  let res = http.get('http://localhost:8765/usercoupon?sample=1')
  check(res, { 'status was 200': (r) => r.status == 200 })
  sleep(1)

  res = http.post('http://localhost:8765/usercoupon?fake=1')
  check(res, { 'status was 201': (r) => r.status == 201 })
  sleep(1)

  // patch

  // put
}
