import { app } from './server'

app.listen(7070, '0.0.0.0', ():void => {
  console.log('Server Running here 👉 https://blacksheep.zapto.org:7070')
})
