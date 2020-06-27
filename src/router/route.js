import Vue from 'vue'
import Router from 'vue-router'
// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'

const Login = () => import('../components/Login.vue')
const Home = () => import('../components/Home.vue')
const Welcome = () => import('../components/Welcome.vue')
const Users = () => import('../components/user/Users.vue')
const Rights = () => import('../components/power/Rights.vue')
const Roles = () => import('../components/power/Roles.vue')
const Cate = () => import('../components/goods/Cate.vue')
const Params = () => import('../components/goods/Params.vue')
const List = () => import('../components/goods/List.vue')
const Add = () => import('../components/goods/Add.vue')
const Order = () => import('../components/order/Order.vue')
const Report = () => import('../components/report/Report.vue')





Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',redirect: '/login'
    },
    {
      path: '/login',component: Login
    },
    {
      path: '/home',
      component: Home,
      redirect:'/welcome',
      children: [
        {
          path:'/welcome',component:Welcome
        },
        {
          path:'/users',component:Users
        },
        {
          path:'/rights',component:Rights
        },
        {
          path:'/roles',component:Roles
        },
        {
          path:'/categories',component:Cate
        },
        {
          path:'/params',component:Params
        },
        {
          path:'/goods',component:List
        },
        {
          path:'/goods/add',component:Add
        },
        {
          path:'/orders',component:Order
        },
        {
          path:'/reports',component:Report
        },
      ]
    },
   
  ]
})

//挂在路由导航守卫
router.beforeEach((to,from,next) => {
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router