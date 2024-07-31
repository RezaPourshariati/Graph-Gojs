import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Slider from 'primevue/slider'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import 'primevue/resources/themes/aura-light-green/theme.css'
import App from './App.vue'

const app = createApp(App)
app.use(PrimeVue)

app.component('Slider', Slider)
app.component('Button', Button)
app.component('InputNumber', InputNumber)

app.mount('#app')

