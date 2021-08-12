import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import InputGroup from '../components/InputGroup';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthDispatch, useAuthState } from '../context/auth';
import { FaExclamationCircle } from 'react-icons/fa';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});

  const router = useRouter();
  const dispatch = useAuthDispatch();

  const { authenticated } = useAuthState();

  if (authenticated) {
    router.push('/');
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const res = await axios.post('/auth/login', {
        password,
        username,
      });
      dispatch('LOGIN', res.data);
      router.back();
    } catch (err) {
      setErrors(err.response.data);
    }
  };

  return (
    <div className="flex bg-white">
      <Head>
        <title>stoclue.com: Login to the dalal street conversation</title>
      </Head>

      <div
        className="w-32 h-screen bg-center bg-cover"
        style={{
          backgroundImage: `url('${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/images/bricks.jpg')`,
        }}
      ></div>

      <div className="flex flex-col justify-center pl-6">
        <div className="w-80">
          <h1 className="mb-2 text-lg font-medium">Login</h1>
          <p className="mb-10 text-xs">
            By continuing, you agree to our User Agreement and Privacy Policy.
          </p>
          <form onSubmit={handleSubmit}>
            <InputGroup
              value={username}
              setValue={setUsername}
              error={errors.username}
              placeholder="USERNAME"
              type="text"
              className="mb-2"
            />
            <InputGroup
              value={password}
              setValue={setPassword}
              error={errors.password}
              placeholder="PASSWORD"
              type="password"
              className="mb-4"
            />
            <button
              type="submit"
              className="w-full py-2 mb-4 text-xs font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded"
            >
              Login
            </button>
          </form>
          <small>
            New to Stoclue?
            <Link href="/register">
              <a className="ml-1 font-bold text-blue-500 uppercase">Sign up</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
