import type { AppProps } from 'next/app';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';
import { SWRConfig } from 'swr';

import { AuthProvider } from '../context/auth';

import '../styles/tailwind.css';
import '../styles/icons.css';

axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + '/api';
axios.defaults.withCredentials = true;

const fetcher = async (url) => {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ['/login', '/register'];
  const authRoute = authRoutes.includes(pathname);

  return (
    <SWRConfig
      value={{
        dedupingInterval: 10000,
        fetcher,
      }}
    >
      <AuthProvider>
        {!authRoute && <Navbar />}
        <div className="pt-12">
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </SWRConfig>
  );
}

export default App;
