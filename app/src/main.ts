import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'

import 'materialize-css/dist/css/materialize.min.css'

axios.defaults.baseURL = 'http://blacksheep.zapto.org:7070/'

createApp(App).mount('#app')
