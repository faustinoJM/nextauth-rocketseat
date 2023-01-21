import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../contexts/AuthContext";
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshing = false;
let failedRequestsQueue: [] = [];

export function setupAPIClient(ctx:any = undefined) {
    let cookies = parseCookies(ctx);

    const api = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: `Bearer ${cookies['nextauth.token']}`
        }
    });
    
    api.interceptors.response.use(response => {
        return response;
    }, (error: AxiosError) => {
        // console.log(error.response?.data)
        if(error.response?.status === 401) {
            // console.log(error.response.data.code+" zabuza")
            if(error.response.data?.code === 'token.expired') {
                //renovar token
                cookies = parseCookies(ctx);
                
                const  { 'nextauth.refreshToken': refreshToken } = cookies;
                const originalConfig = error.config
                // console.log("bla")
                 
                if(!isRefreshing) {
                    isRefreshing = true
                    console.log("refresh")

                                      //body da requisicao na rota refresh
                    api.post('/refresh', { refreshToken }
                    ).then(async response => {
                        // console.log("caso erro /refresh faz return response, e nem entra aqui")
                        const { token } = response.data
                        
                        setCookie(ctx, 'nextauth.token', token, {
                            maxAge: 60 * 60 * 24 * 30, // 30 days
                            path: '/'
                        })
                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30, // 30 days
                            path: '/'
                        })
    
                        api.defaults.headers['Authorization'] = `Bearer ${token}`
                      
                        failedRequestsQueue.forEach( request => request.onSuccess(token))
                        failedRequestsQueue = [];
                    }).catch(err => {
                        failedRequestsQueue.forEach( request => request.onFailure(err))
                        failedRequestsQueue = [];
                        
                        if(process.browser){
                            signOut()
                        }
                        // console.log("Estou aki")
                        // console.log("+house+"+error.response.data.code)
                        
                    }).finally(() => {
                        isRefreshing = false
                        //finally sempre excecuta
                        //  console.log("++ aki")
                    });
                }
      
                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push({
                        onSuccess: (token: string) => {
                            originalConfig.headers['Authorization'] = `Bearer ${token}`
                            
                            resolve(api(originalConfig))
                        }, 
                        onFailure: (err: AxiosError) => {
                            reject(err)
                        }
                    })
                });
            } else {
                //deslogar
                if(process.browser){
                    signOut()
                } else {
                    // console.log("-probally code undefined-"+error.response.data.code)
                    // console.log("-+-lo estou aki")
                    return Promise.reject(new AuthTokenError())
                }
            }
        }
    
        return Promise.reject(error)
    })

    return api;
}
