import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

//high order function quando um funcao retorna uma outra funcao ou recebe outra funcao com parametro
export function withSSRGuest<P>(fn: GetServerSideProps<P>): GetServerSideProps {
   
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(ctx);
        
        if (cookies['nextauth.token']) {
            // console.log("remeber")
          return {
            redirect: { 
              destination: '/dashboard',
              permanent: false,
            } 
          }
        }  

        return await fn(ctx);
    }
}