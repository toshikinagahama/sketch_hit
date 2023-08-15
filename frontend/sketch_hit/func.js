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
    ctx.closePath();
  });
};

/**
 * @brief 直線を描画
 *
 */
export const drawLines = (ctx, lines) => {
  lines.map((line, index) => {
    let endPoint = { x: line.x, y: line.y };
    let theta = (line.a * Math.PI) / 180;
    endPoint.x += line.l * Math.cos(theta);
    endPoint.y += line.l * Math.sin(theta);
    ctx.beginPath();
    ctx.moveTo(line.x, line.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  });
};

/**
 * @brief ターゲットを描画
 *
 */
export const drawTarget = (ctx, t) => {
  if (t.type == 'line') {
    let endPoint = { x: t.x, y: t.y };
    let theta = (t.a * Math.PI) / 180;
    endPoint.x += (t.l * Math.cos(theta)) / 2;
    endPoint.y += (t.l * Math.sin(theta)) / 2;
    ctx.beginPath();
    ctx.moveTo(t.x - (t.l * Math.cos(theta)) / 2, t.y - (t.l * Math.sin(theta)) / 2);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  } else if (t.type == 'circle') {
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2, true);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  } else if (t.type == 'ellipse') {
    let theta = (t.a * Math.PI) / 180;
    ctx.beginPath();
    ctx.ellipse(t.x, t.y, t.r_l, t.r_s, theta, 0, Math.PI * 2);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  }
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
      let tmpData = []; //候補のデータ。交わったデータの中で、筆圧を比較し、筆圧が高かったものを採用する。
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
                tmpData.push({
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
                tmpData.push({
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
              tmpData.push({
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

            //ctx.beginPath();
            //ctx.moveTo(p.x, p.y);
            //ctx.lineTo(q.x, q.y);
            //ctx.lineCap = 'round';
            //ctx.strokeStyle = 'green';
            //ctx.lineWidth = 1;
            //ctx.stroke();
            //ctx.beginPath();
            //ctx.arc(p.x, p.y, 2, 0, Math.PI * 2, true);
            //ctx.strokeStyle = 'green';
            //ctx.lineWidth = 1;
            //ctx.stroke();
            //break;
          }
        }
      }
      if (tmpData.length > 0) {
        let f = tmpData.map(function (p) {
          return p.f;
        });
        let adoptIndex = f.indexOf(Math.max.apply(null, f));
        dataArray[dataArray.length - 1].push(tmpData[adoptIndex]);
      }
    }
  });
  return dataArray;
};

/**
 * @brief 目標直線とのズレを計算
 *
 */
export const getLineHandwritingInfomation = (ctx, lines, ls) => {
  let dataArray = [];
  let num_range = 100; //区間を何等分にするか
  ls.map((l, index) => {
    dataArray.push([]);
    let endPoint = { x: l.x, y: l.y };
    let theta = (l.a * Math.PI) / 180;
    endPoint.x += l.l * Math.cos(theta);
    endPoint.y += l.l * Math.sin(theta);
    let vec0 = { x: endPoint.x - l.x, y: endPoint.y - l.y };
    //console.log(lines);
    for (let i = 0; i < num_range; i++) {
      //区間iにおける目標曲線の接線に垂直な線の算出
      let q = {
        x: ((i + 4) / (num_range + 4)) * vec0.x + l.x,
        y: ((i + 4) / (num_range + 4)) * vec0.y + l.y,
      };
      let l1 = { a: 0, b: 0, c: 0 };
      if (l.a != 90) {
        //y軸に平行ではない場合
        l1 = {
          a: 1.0,
          b: -Math.tan((Math.PI * l.a) / 180),
          c: -q.x + Math.tan((Math.PI * l.a) / 180) * q.y,
        };
      } else {
        //y軸に平行な場合
        l1 = { a: 0.0, b: -1.0, c: q.y };
      }
      //console.log(q);
      //console.log(l1);
      let tmpData = []; //候補のデータ。交わったデータの中で、筆圧を比較し、筆圧が高かったものを採用する。
      //実際の描画線との交点を探す
      for (let j = 0; j < lines.length; j++) {
        let points = lines[j];
        //console.log(points);
        if (points == undefined) continue;
        if (points.length == 0) continue;
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
            let vec = { x: l1.b, y: l1.a };
            //正規化
            let len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
            vec.x /= len;
            vec.y /= len;
            let d = (p.x - q.x) * vec.x + (p.y - q.y) * vec.y; //内積
            if (Math.abs(d) >= 50) continue;

            //力と角度は線形補間
            let t1 = Math.abs(p.x - p1.x);
            let t0 = Math.abs(p.x - p0.x);
            if (t1 == 0 && t0 == 0) {
              t1 = Math.abs(p.y - p1.y);
              t0 = Math.abs(p.y - p0.y);

              if (t1 == 0 && t0 == 0) {
                tmpData.push({
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
                tmpData.push({
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
              tmpData.push({
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

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2, true);
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 1;
            ctx.stroke();
            //break;
          }
        }
      }
      if (tmpData.length > 0) {
        let f = tmpData.map(function (p) {
          return p.f;
        });
        let adoptIndex = f.indexOf(Math.max.apply(null, f));
        dataArray[dataArray.length - 1].push(tmpData[adoptIndex]);
      }
    }
  });
  return dataArray;
};

/**
 * @brief 目標とのズレを計算（線でも、円でも、楕円でも対応
 *
 */
export const getTargetHandwritingInfomation = (ctx, lines, target) => {
  let dataArray = [];
  let num_range = 100; //区間を何等分にするか
  if (target.type == 'line') {
    let endPoint = { x: target.x, y: target.y };
    let theta = (target.a * Math.PI) / 180;
    endPoint.x += (target.l * Math.cos(theta)) / 2;
    endPoint.y += (target.l * Math.sin(theta)) / 2;
    let vec0 = {
      x: endPoint.x - target.x + (target.l * Math.cos(theta)) / 2,
      y: endPoint.y - target.y + (target.l * Math.sin(theta)) / 2,
    };
    for (let i = 0; i < num_range; i++) {
      //区間iにおける目標曲線の接線に垂直な線の算出
      let q = {
        x: ((i + 4) / (num_range + 4)) * vec0.x + target.x - (target.l * Math.cos(theta)) / 2,
        y: ((i + 4) / (num_range + 4)) * vec0.y + target.y - (target.l * Math.sin(theta)) / 2,
      };
      let l1 = { a: 0, b: 0, c: 0 };
      if (target.a != 90) {
        //y軸に平行ではない場合
        l1 = {
          a: 1.0,
          b: Math.tan((Math.PI * target.a) / 180),
          c: -q.x - Math.tan((Math.PI * target.a) / 180) * q.y,
        };
      } else {
        //y軸に平行な場合
        l1 = { a: 0.0, b: -1.0, c: q.y };
      }
      //console.log(q);
      //console.log(l1);
      let tmpData = []; //候補のデータ。交わったデータの中で、筆圧を比較し、筆圧が高かったものを採用する。
      //実際の描画線との交点を探す
      for (let ii = 1; ii < lines.length; ii++) {
        let p1 = lines[ii - 1];
        let p0 = lines[ii - 0];
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
          let vec = { x: l1.b, y: l1.a };
          //正規化
          let len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
          vec.x /= len;
          vec.y /= len;
          let d = (p.x - q.x) * vec.x + (p.y - q.y) * vec.y; //内積
          if (Math.abs(d) >= 50) continue;

          //力と角度は線形補間
          let t1 = Math.abs(p.x - p1.x);
          let t0 = Math.abs(p.x - p0.x);
          if (t1 == 0 && t0 == 0) {
            t1 = Math.abs(p.y - p1.y);
            t0 = Math.abs(p.y - p0.y);

            if (t1 == 0 && t0 == 0) {
              tmpData.push({
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
              tmpData.push({
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
            tmpData.push({
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

          //console.log(p);
          //console.log(q);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'green';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2, true);
          ctx.strokeStyle = 'green';
          ctx.lineWidth = 1;
          ctx.stroke();
          //break;
        }
      }
      if (tmpData.length > 0) {
        let f = tmpData.map(function (p) {
          return p.f;
        });
        let adoptIndex = f.indexOf(Math.max.apply(null, f));
        dataArray.push(tmpData[adoptIndex]);
      }
    }
  } else if (target.type == 'circle') {
    for (let i = 0; i < num_range; i++) {
      //区間iにおける目標曲線の接線に垂直な線の算出
      let q = {
        x: target.r * Math.cos(((2.0 * Math.PI) / num_range) * i) + target.x,
        y: target.r * Math.sin(((2.0 * Math.PI) / num_range) * i) + target.y,
      };
      let l1 = {
        a: q.y - target.y,
        b: -q.x + target.x,
        c: (q.x - target.x) * target.y - (q.y - target.y) * target.x,
      };
      let tmpData = []; //候補のデータ。交わったデータの中で、筆圧を比較し、筆圧が高かったものを採用する。
      //実際の描画線との交点を探す
      for (let ii = 1; ii < lines.length; ii++) {
        let p1 = lines[ii - 1];
        let p0 = lines[ii - 0];
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
          let vec = { x: q.x - target.x, y: q.y - target.y };
          //正規化
          let len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
          vec.x /= len;
          vec.y /= len;
          let d = (p.x - q.x) * vec.x + (p.y - q.y) * vec.y; //内積
          if (Math.abs(d) >= target.r) continue;

          //力と角度は線形補間
          let t1 = Math.abs(p.x - p1.x);
          let t0 = Math.abs(p.x - p0.x);
          if (t1 == 0 && t0 == 0) {
            t1 = Math.abs(p.y - p1.y);
            t0 = Math.abs(p.y - p0.y);

            if (t1 == 0 && t0 == 0) {
              tmpData.push({
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
              tmpData.push({
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
            tmpData.push({
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
        }
      }
      if (tmpData.length > 0) {
        let dis = tmpData.map(function (p) {
          return (p.x_target - p.x) * (p.x_target - p.x) + (p.y_target - p.y) * (p.y_target - p.y);
        });
        let adoptIndex = dis.indexOf(Math.min.apply(null, dis));
        dataArray.push(tmpData[adoptIndex]);
        let p = tmpData[adoptIndex];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x_target, p.y_target);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2, true);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  } else if (target.type == 'ellipse') {
    for (let i = 0; i < num_range; i++) {
      //区間iにおける目標曲線の接線に垂直な線の算出
      let q0 = {
        x: target.r_l * Math.cos(((2.0 * Math.PI) / num_range) * i),
        y: target.r_s * Math.sin(((2.0 * Math.PI) / num_range) * i),
      }; //傾きを考慮しない場合の点
      let theta = (target.a * Math.PI) / 180;
      let q = {
        x: Math.cos(theta) * q0.x - Math.sin(theta) * q0.y,
        y: Math.sin(theta) * q0.x + Math.cos(theta) * q0.y,
      };
      let s0 = (target.r_l * target.r_l * q0.y) / (target.r_s * target.r_s * q0.x);
      let theta2 = Math.atan(s0) + theta;
      let s = Math.tan(theta2);
      q.x += target.x; //中心点
      q.y += target.y; //中心点

      let l1 = {
        a: s,
        b: -1,
        c: q.y - s * q.x,
      };
      let tmpData = []; //候補のデータ。交わったデータの中で、距離が近いものを採用する。
      //実際の描画線との交点を探す
      for (let ii = 1; ii < lines.length; ii++) {
        let p1 = lines[ii - 1];
        let p0 = lines[ii - 0];
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
          let vec = { x: l1.b, y: l1.a };
          //正規化
          let len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
          vec.x /= len;
          vec.y /= len;
          let d = (p.x - q.x) * vec.x + (p.y - q.y) * vec.y; //内積
          //if (Math.abs(d) >= 50) continue;

          //力と角度は線形補間
          let t1 = Math.abs(p.x - p1.x);
          let t0 = Math.abs(p.x - p0.x);
          if (t1 == 0 && t0 == 0) {
            t1 = Math.abs(p.y - p1.y);
            t0 = Math.abs(p.y - p0.y);

            if (t1 == 0 && t0 == 0) {
              tmpData.push({
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
              tmpData.push({
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
            tmpData.push({
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

          //break;
        }
      }
      if (tmpData.length > 0) {
        let dis = tmpData.map(function (p) {
          return (p.x_target - p.x) * (p.x_target - p.x) + (p.y_target - p.y) * (p.y_target - p.y);
        });
        let adoptIndex = dis.indexOf(Math.min.apply(null, dis));
        dataArray.push(tmpData[adoptIndex]);
        let p = tmpData[adoptIndex];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x_target, p.y_target);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2, true);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  return dataArray;
};
