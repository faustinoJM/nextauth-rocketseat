import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import { FormEvent, useContext, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext';
import styles from '../styles/Home.module.css'
import { withSSRGuest } from '../utils/withSSRGuest';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')

  const { signIn, isAuthenticated } = useContext(AuthContext)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password
    }

    await signIn(data)
    
    console.log(isAuthenticated)
    console.log("zabuza")
  }


  return (
  <form onSubmit={handleSubmit}  className={styles.container}>
    <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
    <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
    <button type="submit">Entrar</button>
  </form>     
  )
}

//um metodo executado no server side quando user acessar essa pagina antes de aparecer interface
export const getServerSideProps = withSSRGuest(async (ctx) => {
  // console.log(ctx.req.headers)
  // const cookies = parseCookies(ctx);

  // if (cookies['nextauth.token']) {
  //   return {
  //     redirect: {
  //       destination: '/dashboard',
  //       permanent: false,
  //     } 
  //   }
  // }

  return {

    props: {
    
    } 
  }
})