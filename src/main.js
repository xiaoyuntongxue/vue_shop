import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 引入全局样式
import './assets/css/global.css'

// 配置axios
import axios from 'axios'
// axios请求拦截
axios.interceptors.request.use(config => {
  // console.log(config);
  // 为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
    // 一定要return这个config
  return config
})
Vue.prototype.$http = axios;

// 配置访问的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')