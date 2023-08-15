import Head from 'next/head';
import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { domain_db, http_protcol } from '../../global';
import { useRecoilValue } from 'recoil';
import { userState } from '../../components/atoms';
import { drawTarget, getTargetHandwritingInfomation } from '../../func';
import { useRouter } from 'next/router';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const Random_1 = () => {
  const router = useRouter();
  let canvasRef = useRef(null);
  let type = 0;
  const chartRef = useRef();
  const data = {
    datasets: [
      {
        label: ' dataset',
        data: [],
        showLine: true,
        backgroundColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };
  const options = {
    maintainAspectRatio: false,
  };

  const SUBSTATE = {
    WAIT: 0,
    COUNTDOWN: 1,
    MEASURE: 2,
    CALC_RESULT: 3,
    SHOW_RESULT: 4,
  };
  const [canvas, setCanvas] = useState(null);
  const [context, setContext] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [screenSize, setScreenSize] = useState({ w: 0, h: 0 });
  const [targets, setTargets] = useState([]);
  const linesRef = useRef();
  const [lines, setLines] = useState([]);
  const linesArrayRef = useRef(); //線を保存する配列
  const [linesArray, setLinesArray] = useState([]);
  const [startTime, setStartTIme] = useState(0);
  const [countdownStartTime, setCountdownStartTime] = useState(0);
  const [subState, setSubState] = useState(SUBSTATE.WAIT);
  const [resultTsList, setResultTsList] = useState([]);
  const resultTsListRef = useRef();
  const [resultList, setResultList] = useState([]);
  const resultListRef = useRef();
  //const [subState, setSubState] = useState(SUBSTATE.MEASURE);
  const [targetCount, setTargetCount] = useState(-1);
  let x_last = -10;
  let y_last = -10;
  const user = useRecoilValue(userState);

  const initCanvas = () => {
    console.log(screenSize.w);
    canvas.style.width = screenSize.w * 0.8;
    canvas.style.height = screenSize.h * 0.6;
    canvas.width = screenSize.w * 0.8;
    canvas.height = screenSize.h * 0.6;
  };

  useEffect(() => {
    //setting screen size
    const w = window.innerWidth;
    const h = window.innerHeight;
    setScreenSize({ w: w, h: h });

    //set targets
    const center_x = (w * 0.8) / 2.0;
    const center_y = (h * 0.6) / 2.0;
    let l = w * 0.5;
    let ts = [];
    ts.push({ type: 'line', x: center_x, y: center_y, l: l, a: 10 });
    ts.push({ type: 'line', x: center_x, y: center_y, l: l, a: 20 });
    ts.push({ type: 'line', x: center_x, y: center_y, l: l, a: -30 });
    ts.push({ type: 'line', x: center_x, y: center_y, l: l, a: -40 });
    ts.push({ type: 'line', x: center_x, y: center_y, l: l, a: 90 });
    ts.push({ type: 'circle', x: center_x, y: center_y, r: 20 });
    ts.push({ type: 'circle', x: center_x, y: center_y, r: 30 });
    ts.push({ type: 'circle', x: center_x, y: center_y, r: 50 });
    ts.push({ type: 'circle', x: center_x, y: center_y, r: 100 });
    ts.push({ type: 'ellipse', x: center_x, y: center_y, r_l: 100, r_s: 30, a: 0 });
    ts.push({ type: 'ellipse', x: center_x, y: center_y, r_l: 100, r_s: 30, a: 10 });
    ts.push({ type: 'ellipse', x: center_x, y: center_y, r_l: 100, r_s: 30, a: 20 });
    ts.push({ type: 'ellipse', x: center_x, y: center_y, r_l: 100, r_s: 30, a: 50 });
    ts.push({ type: 'ellipse', x: center_x, y: center_y, r_l: 100, r_s: 30, a: 90 });
    ts.push({ type: 'ellipse', x: center_x, y: center_y, r_l: 100, r_s: 30, a: -10 });
    ts.push({ type: 'ellipse', x: center_x, y: center_y, r_l: 100, r_s: 30, a: -20 });
    ts.push({ type: 'ellipse', x: center_x, y: center_y, r_l: 100, r_s: 30, a: -50 });
    setTargets(ts);
    setStartTIme(performance.now());
  }, []);

  useEffect(() => {
    console.log(screenSize);
    if (canvas == null) {
      setCanvas(canvasRef.current);
    } else {
      setContext(canvas.getContext('2d'));
    }
  }, [screenSize]);

  useEffect(() => {
    if (context == null) {
      return;
    } else {
      initCanvas();
      for (const ev of ['touchstart', 'mousedown']) {
        canvas.addEventListener(ev, function (e) {
          console.log('touch start');
        });
      }
      for (const ev of ['touchend', 'mouseup']) {
        canvas.addEventListener(ev, function (e) {
          console.log('touch end');
          x_last = -10;
          y_last = -10;
        });
      }

      for (const ev of ['touchmove', 'mousemove']) {
        canvas.addEventListener(ev, function (e) {
          e.preventDefault();
          //console.log(e);

          let pressure = 0.1;
          let x, y;
          if (e.touches == null) return;

          //debug用にコメントアウト
          if (e.touches[0]['touchType'] == 'undefined') return;
          if (e.touches[0]['touchType'] != 'stylus') return;
          if (e.touches && e.touches[0] && typeof e.touches[0]['force'] !== 'undefined') {
            if (e.touches[0]['force'] > 0) {
              pressure = e.touches[0]['force'];
            }
          }

          //console.log(e.touches);
          const touch = e.touches ? e.touches[0] : null;
          if (touch) {
            x = e.touches[0].pageX - e.target.offsetLeft;
            y = e.touches[0].pageY - e.target.offsetTop;
            //console.log(touch.force);
            if (x_last == -10) {
              x_last = x;
              y_last = y;
              return;
            }
            if (touch.altitudeAngle == undefined) {
              touch.altitudeAngle = -10;
              touch.azimuthAngle = -10;
            }
            let endTime = performance.now();
            let tmpLines = linesRef.current;
            tmpLines.push({
              index: tmpLines.length,
              x,
              y,
              t: endTime - startTime,
              f: touch.force,
              altitude: touch.altitudeAngle,
              azimuth: touch.azimuthAngle,
            });
            setLines([...tmpLines]);
            //if (touch.force != 0 && touch.force != 1) {
            if (touch.force > 0.0) {
              //if (touch.force > -10) { //本当は0以外
              context.beginPath();
              context.moveTo(x_last, y_last);
              context.lineTo(x, y);
              context.lineCap = 'round';
              context.strokeStyle = 'blue';
              context.setLineDash([]);
              context.lineWidth = 1;
              context.stroke();
              //context.beginPath();
              //context.arc(x, y, 1, 0, Math.PI * 2, true);
              //context.strokeStyle = 'black';
              //context.lineWidth = 1;
              //context.stroke();
            }
          }
          x_last = x;
          y_last = y;
        });
      }
    }
    window.addEventListener('resize', () => {
      //本当はキャンバスサイズも変えたほうがいいが一旦無視
    });
  }, [context]);

  useEffect(() => {
    linesRef.current = [...lines];
  }, [lines]);

  useEffect(() => {
    linesArrayRef.current = [...linesArray];
  }, [linesArray]);

  useEffect(() => {
    resultListRef.current = [...resultList];
  }, [resultList]);

  useEffect(() => {
    resultTsListRef.current = [...resultTsList];
  }, [resultTsList]);

  useEffect(() => {
    switch (subState) {
      case SUBSTATE.WAIT:
        break;
      case SUBSTATE.COUNTDOWN:
        break;
      case SUBSTATE.MEASURE:
        break;
      case SUBSTATE.CALC_RESULT:
        calcResult();
        break;
    }
  }, [subState]);

  useEffect(() => {
    if (0 <= targetCount && targetCount < targets.length) {
      drawTarget(context, targets[targetCount]);
    }
    setCountdownStartTime(performance.now() + 500);
    setCountdown(3);
  }, [targetCount]);

  useEffect(() => {
    let timerID = null;
    switch (subState) {
      case SUBSTATE.COUNTDOWN:
        timerID = setInterval(() => {
          const tmpCountdown = 3.0 - (performance.now() - countdownStartTime) / 1000;
          if (tmpCountdown >= 3.0) {
            setCountdown(3.0);
          } else {
            setCountdown(tmpCountdown);
          }
          if (tmpCountdown < 0) {
            setCountdown(0.0);
            if (tmpCountdown < -0.3) {
              setTargetCount((targetCount) => targetCount + 1);
              setSubState(SUBSTATE.MEASURE);
              clearInterval(timerID);
            }
          }
        }, 100);
        break;
      case SUBSTATE.MEASURE:
        timerID = setInterval(() => {
          const tmpCountdown = 3.0 - (performance.now() - countdownStartTime) / 1000;
          if (tmpCountdown >= 3.0) {
            setCountdown(3.0);
          } else {
            setCountdown(tmpCountdown);
          }
          if (tmpCountdown < 0) {
            setCountdown(0.0);
            if (tmpCountdown < -1.3) {
              //次のターゲットに切り替える
              let tmpResultTs = getTargetHandwritingInfomation(
                context,
                linesRef.current,
                targets[targetCount]
              );
              let tmpResultTsList = resultTsListRef.current;
              console.log(tmpResultTs);
              tmpResultTsList.push(tmpResultTs);
              setResultTsList([...tmpResultTsList]);
              clearCanvas();
              let tmpLinesArray = linesArrayRef.current;
              tmpLinesArray.push(linesRef.current);
              setLinesArray([...tmpLinesArray]);
              setLines([]);
              if (targetCount < targets.length - 1) {
                setTargetCount((targetCount) => targetCount + 1);
              } else {
                setSubState(SUBSTATE.CALC_RESULT);
              }
              clearInterval(timerID);
            }
          }
        }, 100);
        break;
    }
  }, [countdownStartTime]);

  const calcResult = () => {
    //結果を計算
    targets.map((t, i) => {
      //
      const tmpResultTs = resultTsListRef.current[i];
      const tmpLines = linesArrayRef.current[i];
      console.log(i, t, tmpResultTs, tmpLines);
      if (tmpResultTs.length > 0) {
        //正確性計算
        let d_sum = tmpResultTs.reduce((sum, v) => sum + Math.abs(v.d), 0);
        d_sum /= tmpResultTs.length;
        //傾き安定性計算
        let altitude_mean = tmpLines.reduce((sum, v) => sum + v.altitude, 0);
        altitude_mean /= tmpLines.length;
        let altitude_sd = 0.0;
        for (let i = 0; i < tmpLines.length; i++) {
          //
          altitude_sd += (tmpLines[i].altitude - altitude_mean) ** 2;
        }
        altitude_sd /= tmpLines.length - 1;
        altitude_sd = Math.sqrt(altitude_sd);
        //スピード安定性計算
        let speed_mean = 0.0;
        let speed_sd = 0.0;
        for (let i = 1; i < tmpLines.length; i++) {
          //
          speed_mean += tmpLines[i].t - tmpLines[i - 1].t;
        }
        speed_mean /= tmpLines.length - 1; //一番初めの要素にはスピードはないので。
        for (let i = 1; i < tmpLines.length; i++) {
          //
          speed_sd += (tmpLines[i].t - tmpLines[i - 1].t - speed_mean) ** 2;
        }
        speed_sd /= tmpLines.length - 2;
        speed_sd = Math.sqrt(speed_sd);
        //筆圧安定性計算
        let f_mean = tmpLines.reduce((sum, v) => sum + v.f, 0);
        f_mean /= tmpLines.length;
        let f_sd = 0.0;
        for (let i = 0; i < tmpLines.length; i++) {
          //
          f_sd += (tmpLines[i].f - f_mean) ** 2;
        }
        f_sd /= tmpLines.length - 1;
        f_sd = Math.sqrt(f_sd);
        //スピード計算
        //すでに計算している
        console.log('正確性', d_sum);
        console.log('傾き安定性対数', -Math.log(altitude_sd));
        console.log('スピード安定性対数', -Math.log(speed_sd));
        console.log('筆圧安定性対数', -Math.log(f_sd));
        console.log('スピード', speed_mean);
        const tmpResult = {
          d_sum: d_sum,
          altitude_sd_log: -Math.log(altitude_sd),
          speed_sd_log: -Math.log(speed_sd),
          f_sd_log: -Math.log(f_sd),
          speed_mean: speed_mean,
        };
        let tmpResultList = resultListRef.current;
        tmpResultList.push(tmpResult);
        setResultList([...tmpResultList]);
      }
    });
  };

  /**
   * @brief スタートボタンを押下したときの処理
   *
   */
  const handleStartButtonClicked = (e) => {
    setSubState(SUBSTATE.COUNTDOWN);
    setCountdownStartTime(performance.now() + 500);
    setCountdown(3);
  };

  /**
   * @brief 保存して送信ボタンを押下したときの処理
   *
   */
  const handleSendResultButtonClicked = async (e) => {
    console.log(resultList);
    let task_result = {};
    task_result['task'] = { username: user.name, type: 'random_1' };
    task_result['results'] = [];
    targets.map((t, i) => {
      let result = resultList[i];
      if (t.type == 'line') {
        task_result['results'].push({
          type: 'line',
          score: (100 - result.d_sum * 20).toFixed(2),
          d_sum: result.d_sum,
          altitude_sd_log: result.altitude_sd_log,
          speed_sd_log: result.speed_sd_log,
          f_sd_log: result.f_sd_log,
          speed_mean: result.speed_mean,
          x: t.x,
          y: t.y,
          l: t.l,
          a: t.a,
        });
      } else if (t.type == 'ellipse') {
        task_result['results'].push({
          type: 'ellipse',
          score: (100 - result.d_sum * 20).toFixed(2),
          d_sum: result.d_sum,
          altitude_sd_log: result.altitude_sd_log,
          speed_sd_log: result.speed_sd_log,
          f_sd_log: result.f_sd_log,
          speed_mean: result.speed_mean,
          x: t.x,
          y: t.y,
          r_l: t.r_l,
          r_s: t.r_s,
          a: t.a,
        });
      } else if (t.type == 'circle') {
        task_result['results'].push({
          type: 'circle',
          score: (100 - result.d_sum * 20).toFixed(2),
          d_sum: result.d_sum,
          altitude_sd_log: result.altitude_sd_log,
          speed_sd_log: result.speed_sd_log,
          f_sd_log: result.f_sd_log,
          speed_mean: result.speed_mean,
          x: t.x,
          y: t.y,
          r: t.r,
        });
      }
    });
    task_result['results_time_series'] = resultTsList;
    task_result['results_raw_time_series'] = linesArray;
    console.log(task_result);
    let score_mean = 0;
    let cnt_valid_score = 0;
    task_result['results'].map((result, index) => {
      if ((result['score'] -= -1)) {
        score_mean += result['score'];
        cnt_valid_score++;
      }
    });
    if (cnt_valid_score != 0) score_mean /= cnt_valid_score;
    else score_mean = 0;
    const res = await fetch(`${http_protcol}://${domain_db}/save_result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task_result),
    }).catch(() => null);
    const json_data = await res.json().catch(() => null);
    console.log(json_data);
    const result = json_data['result'];
    if (result == 0) {
      alert(`送信が終了しました。スコアは${score_mean}です。`);
      router.push('/select_task');
    } else {
      alert('送信に失敗しました');
    }
  };

  const mainArea = () => {
    switch (subState) {
      case SUBSTATE.WAIT:
        return (
          <div className="absolute h-screen w-screen">
            <div className="flex h-full w-full flex-col items-center justify-center">
              <button
                className="rounded-md bg-black px-8 py-2 text-white"
                onClick={(e) => handleStartButtonClicked(e)}
              >
                Game Start
              </button>
            </div>
          </div>
        );
      case SUBSTATE.COUNTDOWN:
        return (
          <div className="">
            <div className="text-4xl">{countdown.toFixed(0)}</div>
          </div>
        );
      case SUBSTATE.MEASURE:
        return (
          <>
            <div className="mb-2 text-black">{countdown.toFixed(0)}</div>
            <div>
              {screenSize.w}, {screenSize.h}
            </div>
          </>
        );
      case SUBSTATE.CALC_RESULT:
        return (
          <>
            <div>解析中...</div>
          </>
        );
      default:
        <button
          className="rounded-md bg-black px-8 py-2 text-white"
          onClick={(e) => handleStartButtonClicked(e)}
        >
          Game Start
        </button>;
    }
  };

  /**
   * @brief キャンバスをクリア
   *
   */
  const clearCanvas = () => {
    if (context != null) context.clearRect(0, 0, canvas.width, canvas.height);
  };
  return (
    <div>
      <Head>
        <title>Apple Pencil Test</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative h-screen w-screen bg-gradient-to-br from-slate-200 to-slate-300">
        <div className="absolute flex h-screen w-screen flex-col items-center justify-center">
          {mainArea()}
          <canvas
            ref={canvasRef}
            className={`bg-gray-50 ${subState == SUBSTATE.MEASURE ? 'block' : 'hidden'}`}
          ></canvas>
        </div>
        <div className="absolute top-8 left-72 mx-auto flex flex-col justify-center">
          <div className="mb-2">名前： {user.name}</div>
          <div>点線をなぞってください</div>
        </div>
        <div
          className="absolute top-4 right-4 rounded-md bg-orange-800 px-4 py-2 text-white"
          onClick={(e) => handleSendResultButtonClicked(e)}
        >
          結果を送信
        </div>
      </div>
    </div>
  );
};

export default Random_1;
