import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'

axios.defaults.baseURL = 'http://readmythoughts.ddns.net:7070/'

createApp(App).mount('#app')
