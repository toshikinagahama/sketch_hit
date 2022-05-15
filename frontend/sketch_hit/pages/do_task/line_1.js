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
import { Line, Scatter } from 'react-chartjs-2';
import { domain_db, http_protcol } from '../../global';
import { useRecoilValue } from 'recoil';
import { userState } from '../../components/atoms';
import { drawLines, getLineHandwritingInfomation } from '../../func';
import { useRouter } from 'next/router';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const Line_1 = () => {
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

  const [canvas, setCanvas] = useState(null);
  const [context, setContext] = useState(null);
  const [screenSize, setScreenSize] = useState({ w: 0, h: 0 });
  const [targetLines, setTargetLines] = useState([]);
  const pointsRef = useRef();
  const linesRef = useRef();
  const [points, setPoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [startTime, setStartTIme] = useState(0);
  let x_last = -10;
  let y_last = -10;
  const user = useRecoilValue(userState);

  useEffect(() => {
    //setting screen size
    setScreenSize({ w: window.innerWidth, h: window.innerHeight });

    //set target lines
    let ls = []; //lines
    for (let i = 0; i < 6; i++) {
      ls.push({ x: 100, y: 100 * (i + 1) + 150, l: 600, a: 0 });
    }
    setTargetLines(ls);
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
      canvas.style.width = screenSize.w;
      canvas.style.height = screenSize.h;
      canvas.width = screenSize.w;
      canvas.height = screenSize.h;
      drawLines(context, targetLines);
      for (const ev of ['touchstart', 'mousedown']) {
        canvas.addEventListener(ev, function (e) {
          console.log('touch start');
          setLines([...linesRef.current, []]);
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
          if (e.touches[0]['touchType'] == 'undefined') return;
          if (e.touches[0]['touchType'] != 'stylus') return;
          if (e.touches && e.touches[0] && typeof e.touches[0]['force'] !== 'undefined') {
            if (e.touches[0]['force'] > 0) {
              pressure = e.touches[0]['force'];
            }
          }
          const touch = e.touches ? e.touches[0] : null;
          if (touch) {
            x = e.touches[0].pageX - e.target.offsetLeft;
            y = e.touches[0].pageY - e.target.offsetTop;
            // console.log(touch);
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
            tmpLines[tmpLines.length - 1].push({
              x,
              y,
              t: endTime - startTime,
              f: touch.force,
              altitude: touch.altitudeAngle,
              azimuth: touch.azimuthAngle,
            });
            setLines([...tmpLines]);
            setPoints([
              ...pointsRef.current,
              {
                x,
                y,
                t: endTime - startTime,
                f: touch.force,
                altitude: touch.altitudeAngle,
                azimuth: touch.azimuthAngle,
              },
            ]);
            //if (touch.force != 0 && touch.force != 1) {
            if (touch.force != 0) {
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
  }, [context]);

  useEffect(() => {
    pointsRef.current = [...points];
    //console.log(points);
  }, [points]);

  useEffect(() => {
    linesRef.current = [...lines];
    //console.log(lines);
  }, [lines]);

  /**
   * @brief クリアボタンを押下したときの処理
   *
   */
  const handleClearCanvasButtonClicked = (e) => {
    clearCanvas();
  };

  /**
   * @brief 保存して送信ボタンを押下したときの処理
   *
   */
  const handleSendResultButtonClicked = async (e) => {
    const dataArray_all = getLineHandwritingInfomation(context, lines, targetLines);
    let task_result = {};
    task_result['task'] = { username: user.name, type: 'line_1' };
    task_result['results'] = [];
    targetLines.map((l, i) => {
      let dataArray = dataArray_all[i];
      //console.log(dataArray);
      let tmp = 0.0; //スコアは仮で、distanceの絶対値の合計を半径で割ったものとする。
      dataArray.map((d) => {
        tmp += Math.abs(d.d);
      });
      if (dataArray.length != 0) {
        tmp /= dataArray.length;
        tmp /= 50;
        tmp = 100 * (1.0 - tmp * 5.0);
      } else {
        tmp = -1;
      }
      task_result['results'].push({ type: 'line', score: tmp, x: l.x, y: l.y, l: l.l, a: l.a });
    });
    task_result['results_time_series'] = dataArray_all;
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
    let data = []; //グラフのデータ
    for (let i = 0; i < dataArray_all[0].length; i++) {
      switch (type) {
        case 0:
          data.push({ x: dataArray_all[0][i].index, y: dataArray_all[0][i].d });
          break;
        case 1:
          data.push({ x: dataArray_all[0][i].index, y: dataArray_all[0][i].f });
          break;
        case 2:
          data.push({ x: dataArray_all[0][i].index, y: dataArray_all[0][i].altitude });
          break;
        case 3:
          data.push({ x: dataArray_all[0][i].index, y: dataArray_all[0][i].azimuth });
          break;
        case 4:
          data.push({ x: dataArray_all[0][i].index, y: dataArray_all[0][i].t });
          break;
        default:
          break;
      }
    }
    console.log(data);
    let chartInstance = chartRef.current;
    chartInstance.data.datasets[0].data = [];
    chartInstance.data.datasets[0].data = data;
    switch (type) {
      case 0:
        chartInstance.data.datasets[0].label = 'distance';
        break;
      case 1:
        chartInstance.data.datasets[0].label = 'pressure';
        break;
      case 2:
        chartInstance.data.datasets[0].label = 'altitude';
        break;
      case 3:
        chartInstance.data.datasets[0].label = 'azimuth';
        break;
      case 4:
        chartInstance.data.datasets[0].label = 'time';
        break;
      default:
        break;
    }
    chartInstance.update();
    type++;
    if (type >= 5) type = 0;
  };

  /**
   * @brief キャンバスをクリア
   *
   */
  const clearCanvas = () => {
    setPoints([]);
    setLines([]);
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawLines(context, targetLines);
  };
  return (
    <div>
      <Head>
        <title>Apple Pencil Test</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative h-screen w-screen">
        <canvas
          ref={canvasRef}
          className="absolute bg-gradient-to-br from-slate-300 to-slate-400"
        ></canvas>

        <div className="absolute bottom-4 flex flex-col items-center justify-center rounded-md px-2 py-2">
          <Scatter height={300} width={800} data={data} options={options} ref={chartRef} />
        </div>

        <div className="absolute top-8 left-72 mx-auto flex flex-col justify-center">
          <div className="mb-2">あなたの名前： {user.name}</div>
          <div>点線の直線をなぞってください</div>
        </div>

        <div
          className="absolute top-4 right-4 rounded-md bg-orange-800 px-4 py-2 text-white"
          onClick={(e) => handleSendResultButtonClicked(e)}
        >
          結果を送信
        </div>

        <div
          className="absolute top-4 left-4 rounded-md bg-black px-2 py-2 text-white"
          onClick={(e) => handleClearCanvasButtonClicked(e)}
        >
          clear canvas
        </div>
      </div>
    </div>
  );
};

export default Line_1;
