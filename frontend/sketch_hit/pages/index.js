import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useRef, createRef } from 'react';
import { useRecoilState } from 'recoil';
import { userState } from '../components/atoms';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [user, setUser] = useRecoilState(userState);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleStartTaskButtonClick = (e) => {
    setUser({ name: username });
    router.push('/select_task');
  };

  return (
    <div className="bg-gradient-to-br from-slate-600 to-slate-700 flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Sketch Hit</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <input
          className="bg-opacity-10 bg-white px-4 py-2 rounded-md text-black focus:outline-none"
          value={username}
          placeholder="名前"
          onChange={handleUsernameChange}
        />
        <div>
          <button
            className="mt-4 px-16 py-2 bg-black text-white rounded-md"
            onClick={handleStartTaskButtonClick}
          >
            テスト開始
          </button>
        </div>
        <div className="m-20"></div>
        <div>
          <Link href="/select_result">
            <a className="mt-4 px-12 py-2 bg-opacity-25 bg-black text-white text-xs rounded-md">
              過去の結果を見る
            </a>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
