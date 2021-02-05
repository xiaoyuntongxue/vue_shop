import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 引入全局样式
import './assets/css/global.css'

// 引入vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'

// 引入vue-quill-editor(富文本编辑器)
import VueQuillEditor from 'vue-quill-editor'
// 将VueQuillEditor注册为全局可用的组件
Vue.use(VueQuillEditor)

// 引入echarts
import echarts from 'echarts'
Vue.prototype.$echarts = echarts

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

// 全局注册组件
Vue.component('tree-table', TreeTable)

// 注册时间过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 配置访问的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')