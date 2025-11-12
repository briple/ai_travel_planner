
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VueAmap from '@vuemap/vue-amap'

const app = createApp(App)

// 配置高德地图
app.use(VueAmap, {
  key: '7a9824f0e428a15cb02a3700f5836063', // 您的高德地图key
  version: '2.0',
  plugins: [
    'AMap.Geocoder',
    'AMap.Driving',
    'AMap.Walking', 
    'AMap.Transfer',
    'AMap.Scale',
    'AMap.ToolBar',
    'AMap.HawkEye',
    'AMap.InfoWindow',
    'AMap.Riding'
  ],
  AMapUI: {
    version: '1.1',
    plugins: ['overlay/DragRoute']
  }
})
app.use(router)
app.use(ElementPlus)

app.mount('#app')