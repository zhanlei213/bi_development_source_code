import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

import mysqlConfigObj from "../config/mysqlDbServer";



// create an axios instance
// 线上环境配置axios.defaults.baseURL，生产环境则用proxy代理

const service = axios.create({
  baseURL:mysqlConfigObj.baseURL, // api 的 base_url
  // baseURL:process.env.VUE_APP_ENV_NAME!== 'development'? $config.devBaseUri:$config.prdBaseUri, // api 的 base_url
  timeout: 30000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // Do something before request is sent
    if (store.getters.token) {
      // 让每个请求携带token-- ['X-Litemall-Admin-Token']为自定义key 请根据实际情况自行修改
      config.headers['X-Litemall-Admin-Token'] = getToken()
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data

    if (res.errno === 501) {
      MessageBox.alert('系统未登录，请重新登录', '错误', {
        confirmButtonText: '确定',
        type: 'error'
      }).then(() => {
        store.dispatch('FedLogOut').then(() => {
          location.reload()
        })
      })
      return Promise.reject('error')
    } else if (res.errno === 502||res.errno === 401||res.errno === 710) {
      MessageBox.alert(''+res.errmsg, '错误', {
        confirmButtonText: '确定',
        type: 'error'
      })
      return Promise.reject('error')
    } else if (res.errno === 503) {
      MessageBox.alert('请求业务目前未支持', '警告', {
        confirmButtonText: '确定',
        type: 'error'
      })
      return Promise.reject('error')
    } else if (res.errno === 504) {
      MessageBox.alert('更新数据已经失效，请刷新页面重新操作', '警告', {
        confirmButtonText: '确定',
        type: 'error'
      })
      return Promise.reject('error')
    } else if (res.errno === 505) {
      MessageBox.alert('更新失败，请再尝试一次', '警告', {
        confirmButtonText: '确定',
        type: 'error'
      })
      return Promise.reject('error')
    } else if (res.errno === 506) {
      MessageBox.alert('没有操作权限，请联系管理员授权', '错误', {
        confirmButtonText: '确定',
        type: 'error'
      })
      return Promise.reject('error')
    } else if (res.errno !== 0) {
      // 非5xx的错误属于业务错误，留给具体页面处理
      return Promise.reject(response)
    } else {
      return response
    }
  }, error => {
    console.log('err' + error)// for debug
    // Message({
    //   message: '登录连接超时（后台不能连接，请联系系统管理员）',
    //   type: 'error',
    //   duration: 3 * 1000
    // })
    return Promise.reject(error)
  })

export default service
