import { redirect } from "next/dist/server/api-utils";
import { destroyCookie } from "nookies";
import { useContext, useEffect } from "react"
import { Can } from "../components/Can";
import { AuthContext } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { AuthTokenError } from "../services/errors/AuthTokenError";

import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
    const { user, signOut } = useContext(AuthContext);

    // const userCanSeeMetrics = useCan({
    //     roles: ['editor', 'administrator']
    // })

    useEffect(() => {
        api.get('/me')
            .then(response => console.log(response))
            .catch(err => console.log(err))
    }, [])

    return (
        <>
            <h1>Dashboard: {user?.email}</h1>
            {/* { userCanSeeMetrics && <div>Metricas</div>} */}
            <Can permissions={['metrics.list']}>
                <div>Metricas</div>
            </Can>

            <button onClick={signOut}>Sign out</button>
        </>
        )
}

//api.get(/me) do ssr eh executado primeiro antes do useEffect acima e do AuthProvider
//logo faz refresh ou executa api.get(/refresh) primeiro no ssr
//logo no browser(client side) o useEffect(api.get(/me)) e executado ja com nova token e refresh token
//por isso no network nao vemos a requisao refresh no browser porque ja nao precisava o ssr ja atulizou
export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx);

    const response = await apiClient.get('/me')
    console.log(response.data)
    
    // try {
    //     const response = await apiClient.get('/me')
    //     console.log(response.data)
    // } catch (err) {
    //     console.log("here i am")
    //       return {
    //           redirect: {
    //               destination: '/',
    //               permanent: false
    //           }
    //     }           
    // } 
       
    
 
    return {
        props: {}
    }
})