import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useRef } from 'react';
import { userState } from '../components/atoms';
import { useRecoilValue } from 'recoil';
import { domain_db, http_protcol } from '../global';

export default function Select_results(pageProps) {
  const user = useRecoilValue(userState);
  const [result_ids, setResult_ids] = useState([]);
  useEffect(() => {
    async function fetchResults() {
      const res = await fetch(`${http_protcol}://${domain_db}/api/get_results`, {
        method: 'GET',
      }).catch(() => null);
      const json_data = await res.json().catch(() => null);
      console.log(json_data);
      const results = json_data['results'];
      let tmp_ids = [];
      results.map((r, i) => {
        tmp_ids.push(r.ID);
      });
      setResult_ids(tmp_ids);
    }
    fetchResults();
  }, []);
  return (
    <div className="flex min-h-screen flex-row justify-center bg-gradient-to-br from-slate-600 to-slate-700">
      <Head>
        <title>結果選択</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex w-full max-w-md flex-col items-center justify-start py-2">
        <h1 className="mt-32 border-b-2 px-12 pb-4 text-xl text-white">結果を選択してください</h1>

        <div className="m-16"></div>
        {result_ids.map((id, i) => {
          return (
            <Link href={`view_result/${id}`} key={i}>
              <a className="my-4 w-8/12 rounded-md bg-black bg-opacity-25 py-4 text-center text-xs text-white">
                {i}
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
