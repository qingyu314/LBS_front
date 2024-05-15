import axios from 'axios';

const request = axios.create({
    // baseURL: 'http://localhost:9091',
    baseURL: 'http://192.168.43.105:9091',
    timeout: 15000
});

// request 拦截器
// 可以自请求发送前对请求做一些处理
// 比如统一加token，对请求参数统一加密
request.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';

    // 从localStorage中获取token
    const token = sessionStorage.getItem('token');
    // 如果token存在，则添加到请求头中
    if (token) {
        config.headers['Authorization'] = `${token}`;
    }

    return config;
}, error => {
    console.log('request error: ' + error);
    return Promise.reject(error);
});

// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use(
    response => {
        // console.log('response: ' + response);
        return response;
    }, error => {
        console.log('response error: ' + error);
        return Promise.reject(error);
    }
);

export default request;
