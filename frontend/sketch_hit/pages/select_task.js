import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useRef } from 'react';
import { userState } from '../components/atoms';
import { useRecoilValue } from 'recoil';

export default function Select_task(pageProps) {
  const user = useRecoilValue(userState);
  useEffect(() => {
    console.log(user.name);
  }, []);
  return (
    <div className="flex min-h-screen flex-row justify-center bg-gradient-to-br from-slate-600 to-slate-700">
      <Head>
        <title>課題選択</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex w-full max-w-md flex-col items-center justify-start py-2">
        <h1 className="mt-32 border-b-2 px-12 pb-4 text-xl text-white">課題を選択してください</h1>

        <div className="m-16"></div>
        <div className="my-4 flex w-full flex-row justify-center">
          <Link href="/do_task/circle_1">
            <a className="mt-4 w-6/12 rounded-md bg-black py-2 text-center text-white">円</a>
          </Link>
        </div>
        <div className="my-4 flex w-full flex-row justify-center">
          <Link href="/do_task/line_1">
            <a className="mt-4 w-6/12 rounded-md bg-black py-2 text-center text-white">横線</a>
          </Link>
        </div>
        <div className="my-4 flex w-full flex-row justify-center">
          <Link href="/do_task/line_2">
            <a className="mt-4 w-6/12 rounded-md bg-black py-2 text-center text-white">縦線</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
