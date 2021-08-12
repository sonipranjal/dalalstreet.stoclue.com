import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthState } from '../context/auth';

import InputGroup from '../components/InputGroup';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const router = useRouter();
  const { authenticated } = useAuthState();

  if (authenticated) {
    router.push('/');
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!agreement) {
      setErrors({ ...errors, agreement: 'You must agree to T&Cs' });
      return;
    }

    try {
      await axios.post('/auth/register', {
        email,
        password,
        username,
      });
      router.push('/login');
    } catch (err) {
      setErrors(err.response.data);
    }
  };

  return (
    <div className="flex bg-white">
      <Head>
        <title>stoclue.com: Join the dalal street conversation</title>
      </Head>

      <div
        className="w-32 h-screen bg-center bg-cover"
        style={{
          backgroundImage: `url('${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/images/bricks.jpg')`,
        }}
      ></div>

      <div className="flex flex-col justify-center pl-6">
        <div className="w-80">
          <h1 className="mb-2 text-lg font-medium">Sign Up</h1>
          <p className="mb-10 text-xs">
            By continuing, you agree to our User Agreement and Privacy Policy.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <input
                type="checkbox"
                className="mr-1 cursor-pointer"
                id="agreement"
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
              />
              <label
                htmlFor="agreement"
                className="text-xs cursor-pointer select-none"
              >
                I agree to get emails about cool stuff on Stoclue
              </label>
              <small className="block font-medium text-red-600">
                {errors.agreement}
              </small>
            </div>
            <InputGroup
              value={email}
              setValue={setEmail}
              error={errors.email}
              placeholder="EMAIL"
              type="email"
              className="mb-2"
            />

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
              Sign Up
            </button>
          </form>
          <small>
            Already a member?
            <Link href="/login">
              <a className="ml-1 font-bold text-blue-500 uppercases">LOG IN</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
