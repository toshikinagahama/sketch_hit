/**
 * @brief 円を描画
 *
 */
export const drawCircles = (ctx, circles) => {
  circles.map((circle, index) => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2, true);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
};

/**
 * @brief 目標円とのズレを計算
 *
 */
export const getCircleHandwritingInfomation = (lines, circles) => {
  //for (let i = 0; i < lines.length; i++) {
  //  for (let j = 0; j < lines[i].length; j++) {
  //    lines[i][j].t -= lines[i][0].t;
  //  }
  //}
  console.log(lines);
  let dataArray = [];
  let num_range = 100; //区間を何等分にするか
  circles.map((c, index) => {
    dataArray.push([]);
    for (let i = 0; i < num_range; i++) {
      //区間iにおける目標曲線の接線に垂直な線の算出
      let q = {
        x: c.r * Math.cos(((2.0 * Math.PI) / num_range) * i) + c.x,
        y: c.r * Math.sin(((2.0 * Math.PI) / num_range) * i) + c.y,
      };
      let l1 = { a: q.y - c.y, b: -q.x + c.x, c: (q.x - c.x) * c.y - (q.y - c.y) * c.x };
      //実際の描画線との交点を探す
      for (let j = 0; j < lines.length; j++) {
        let points = lines[j];
        if (points == undefined) continue;
        if (points.length == 0) continue;
        let distance0 = Math.sqrt(
          (points[0].x - c.x) * (points[0].x - c.x) + (points[0].y - c.y) * (points[0].y - c.y)
        );
        if (distance0 >= 2.0 * c.r) {
          //最初の点が、円からあまりにかけ離れてたら、カウントしない。
          continue;
        }
        for (let ii = 1; ii < points.length; ii++) {
          let p1 = points[ii - 1];
          let p0 = points[ii - 0];
          let l2 = {
            a: p1.y - p0.y,
            b: -p1.x + p0.x,
            c: (p1.x - p0.x) * p0.y - (p1.y - p0.y) * p0.x,
          };
          //交点の算出
          let tc = l1.a * p0.x + l1.b * p0.y + l1.c;
          let td = l1.a * p1.x + l1.b * p1.y + l1.c;
          if (tc * td >= 0) continue;

          let tmp = l1.a * l2.b - l2.a * l1.b;
          if (tmp != 0) {
            let p = { x: (l1.b * l2.c - l2.b * l1.c) / tmp, y: (l2.a * l1.c - l1.a * l2.c) / tmp };
            //向き判定
            let vec = { x: q.x - c.x, y: q.y - c.y };
            //正規化
            let len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
            vec.x /= len;
            vec.y /= len;
            let d = (p.x - q.x) * vec.x + (p.y - q.y) * vec.y; //内積
            if (Math.abs(d) >= c.r) continue;

            //力と角度は線形補間
            let t1 = Math.abs(p.x - p1.x);
            let t0 = Math.abs(p.x - p0.x);
            if (t1 == 0 && t0 == 0) {
              t1 = Math.abs(p.y - p1.y);
              t0 = Math.abs(p.y - p0.y);

              if (t1 == 0 && t0 == 0) {
                dataArray[dataArray.length - 1].push({
                  index: i,
                  t: p0.t,
                  x_target: q.x,
                  y_target: q.y,
                  x: p.x,
                  y: p.y,
                  d: d,
                  f: p0.f,
                  altitude: p0.altitude,
                  azimuth: p0.azimuth,
                });
              } else {
                let f = (t1 / (t1 + t0)) * p0.f + (t0 / (t1 + t0)) * p1.f;
                let altitude = (t1 / (t1 + t0)) * p0.altitude + (t0 / (t1 + t0)) * p1.altitude;
                let azimuth = (t1 / (t1 + t0)) * p0.azimuth + (t0 / (t1 + t0)) * p1.azimuth;
                let time = (t1 / (t1 + t0)) * p0.t + (t0 / (t1 + t0)) * p1.t;
                dataArray[dataArray.length - 1].push({
                  index: i,
                  t: time,
                  x_target: q.x,
                  y_target: q.y,
                  x: p.x,
                  y: p.y,
                  d: d,
                  f: f,
                  altitude: altitude,
                  azimuth: azimuth,
                });
              }
            } else {
              let f = (t1 / (t1 + t0)) * p0.f + (t0 / (t1 + t0)) * p1.f;
              let altitude = (t1 / (t1 + t0)) * p0.altitude + (t0 / (t1 + t0)) * p1.altitude;
              let azimuth = (t1 / (t1 + t0)) * p0.azimuth + (t0 / (t1 + t0)) * p1.azimuth;
              let time = (t1 / (t1 + t0)) * p0.t + (t0 / (t1 + t0)) * p1.t;
              dataArray[dataArray.length - 1].push({
                index: i,
                t: time,
                x_target: q.x,
                y_target: q.y,
                x: p.x,
                y: p.y,
                d: d,
                f: f,
                altitude: altitude,
                azimuth: azimuth,
              });
            }

            //context.beginPath();
            //context.moveTo(p.x, p.y);
            //context.lineTo(q.x, q.y);
            //context.lineCap = 'round';
            //context.strokeStyle = 'green';
            //context.lineWidth = 1;
            //context.stroke();
            //context.beginPath();
            //context.arc(p.x, p.y, 2, 0, Math.PI * 2, true);
            //context.strokeStyle = 'green';
            //context.lineWidth = 1;
            //context.stroke();
            break;
          }
        }
      }
    }
  });
  return dataArray;
};
