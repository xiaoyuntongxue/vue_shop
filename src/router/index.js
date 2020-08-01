import Vue from 'vue'
import VueRouter from 'vue-router'

// 引入路由组件
const Login = () =>
  import ('../components/Login')
const Home = () =>
  import ('../components/Home')
const Welcome = () =>
  import ('../components/Welcome')
const Users = () =>
  import ('../components/users/Users')
const Rights = () =>
  import ('../components/power/Rights')
const Roles = () =>
  import ('../components/power/Roles')
const Cate = () =>
  import ('../components/goods/Cate')

Vue.use(VueRouter)

const routes = [{
    path: '',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    children: [{
        path: '',
        redirect: '/welcome'
      },
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      }
    ]
  }
]

const router = new VueRouter({
  routes,
  // mode: 'history'
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to: 将要访问的界面
  // from: 从哪个界面来的
  // next: 函数，代表跳转到下一个界面
  if (to.path === '/login') return next();
  // 获取暂存在sessionStorage中的token值进行判断 
  const tokenStr = window.sessionStorage.getItem('token');
  // 判断是否存在token值，如果存在，则同意访问，不存在就不同意
  if (!tokenStr) return next('/login');
  next();
})

export default router