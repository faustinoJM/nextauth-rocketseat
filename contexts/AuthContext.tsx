import { createContext, ReactNode, useEffect, useState} from "react";

import Router, { useRouter } from "next/router"
import { destroyCookie, parseCookies, setCookie } from "nookies"
import { AxiosHeaders, RawAxiosResponseHeaders } from "axios";
import { api } from "../services/apiClient";

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    // signIn(credentials: SignInCredentials): Promise<void>;
    signIn: (credentials: SignInCredentials) => Promise<void>;
    // signOut(): void;
    signOut: () => void;
    user: User;
    isAuthenticated: boolean;
}

type AuthProviderProps = {
    children: ReactNode;
}


export const AuthContext = createContext({} as AuthContextData)

var authChannel: BroadcastChannel

export function signOut() {
    destroyCookie(undefined, 'nextauth.token')
    destroyCookie(undefined, 'nextauth.refreshToken')

    authChannel.postMessage('signOut')

    Router.push('/')
}
export function AuthProvider ({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>()    
    const router = useRouter();

    const isAuthenticated = !!user;
    
    useEffect(() => {
        authChannel = new BroadcastChannel('auth')

        authChannel.onmessage = (message) => {
            console.log(message)
            switch (message.data) {
                // case 'signOut':
                //     signOut();
                //     break;
                // case 'signIn':
                //     Router.push('/dashboard')
                default:
                    break;

            }
        }
    }, [])

    //Executa uma vez vez logo quando eh carregado primeira componente ou pagina
    // ou seja comecou aplicao e excutado dentro AuthProvider
    //nb: e tambem quando e reiniciado executa logo de primeira
    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies()

        if(token) {
            api.get('/me').then(response => {
                const { email, permissions, roles } = response.data
                console.log(response)
    
                setUser({ email, permissions, roles})
                // const auth = response.config.headers['Authorization']
            }).catch(() => {
                if(process.browser)
                signOut();
            })
        }
        
    }, [])

    async function signIn({ email, password }: SignInCredentials) {
        //console.log({ email, password})
        try{
            const response = await api.post('sessions', {
                email,
                password
            })

            const { token, refreshToken, permissions, roles } = response.data

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
            })
            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
            })

            setUser({
                email,
                permissions,
                roles
            })

            api.defaults.headers['Authorization'] = `Bearer ${token}`
            Router.push('/dashboard')
            //console.log(response.data)
            // authChannel.postMessage('signIn')
        } catch(err) {
            console.log(err)
        }
    }
    
    return (
        <AuthContext.Provider value={{ signIn, isAuthenticated, user, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}