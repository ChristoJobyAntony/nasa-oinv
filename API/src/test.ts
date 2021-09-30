import axios from 'axios'
import { app } from './server'

// Listen to server
app.listen(7070, '0.0.0.0', ():void => {
  console.log('Server Running here 👉 https://readmythoughts.ddns.net:7070')
})

// // Test 1
axios.get(
  'http://readmythoughts.ddns.net:7070/Dataset/getAllRelations',
  { params: { identity: 2131 } }
).then((response) => {
  console.log('RESPONSE BODY')
  console.log(response.data)
}).catch((e) => {
  console.log('Query Failed !')
  console.log(e)
})

// Test 2
axios.get(
  'http://readmythoughts.ddns.net:7070/Node/getAllRelations',
  { params: { identity: 3 } }
).then((response) => {
  console.log('RESPONSE BODY')
  console.log(response.data)
}).catch((e) => {
  console.log('Query Failed !')
  console.log(e)
})

// Test 3
axios.get(
  'http://readmythoughts.ddns.net:7070/Dataset/info',
  { params: { identity: 2131 } }
).then((response) => {
  console.log('RESPONSE BODY')
  console.log(response.data)
}).catch((e) => {
  console.log('Query Failed !')
  console.log(e)
})
