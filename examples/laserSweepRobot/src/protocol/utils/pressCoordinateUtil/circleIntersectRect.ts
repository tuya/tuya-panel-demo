interface Point {
  x: number;
  y: number;
}

interface Circle extends Point {
  radius: number;
}

type Polygon = Point[];

type Line = [Point, Point];

type Rect = [Point, Point, Point, Point];

type RectLines = [Line, Line, Line, Line];

function getLinesByRect(rect: Rect): RectLines {
  const length = rect.length;
  let lines = [];
  let prePoint, curPoint, first;

  for (let index = 0; index < length; index++) {
    curPoint = rect[index];
    if (index === 0) {
      first = curPoint;
    } else if (index > 0) {
      lines.push([prePoint, curPoint]);
    }

    if (index === length - 1) {
      lines.push([curPoint, first]);
    }
    prePoint = curPoint;
  }
  return lines;
}

function distanceOfPoints({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point) {
  return (x2 - x1) ** 2 + (y2 - y1) ** 2;
}

function isCenterInsidePolygon(p: Point, polygon: Polygon) {
  var px = p.x,
    py = p.y,
    sum = 0;

  for (var i = 0, l = polygon.length, j = l - 1; i < l; j = i, i++) {
    var sx = polygon[i].x,
      sy = polygon[i].y,
      tx = polygon[j].x,
      ty = polygon[j].y;

    // 点与多边形顶点重合或在多边形的边上
    if (
      (sx - px) * (px - tx) >= 0 &&
      (sy - py) * (py - ty) >= 0 &&
      (px - sx) * (ty - sy) === (py - sy) * (tx - sx)
    ) {
      return true;
    }

    // 点与相邻顶点连线的夹角
    var angle = Math.atan2(sy - py, sx - px) - Math.atan2(ty - py, tx - px);

    // 确保夹角不超出取值范围（-π 到 π）
    if (angle >= Math.PI) {
      angle = angle - Math.PI * 2;
    } else if (angle <= -Math.PI) {
      angle = angle + Math.PI * 2;
    }

    sum += angle;
  }

  // 计算回转数并判断点和多边形的几何关系
  return Math.round(sum / Math.PI) === 0 ? false : true;
}

function lineInCircle(circle: Circle, line1: Line, rect: Rect) {
  // *  1:两个端点都在圆内, 一定不相交, 可以把两个点带入圆的方程判断 是否小于0
  // *  2:两个端点,一个在圆内,一个在圆外, 一定相交, 同样 点带入方程 判断
  // *  3:两个端点都在外面, 此时略微麻烦, 可以通过点到直线的距离来判断,但是当直线和圆心一条直线时,此时需要特别处理.光有距离判断是不行的. 要通过角度来判断.-->余弦方程 转
  const { radius: r } = circle;
  const cd = r ** 2;

  const d3 = pointToLine(circle, line1) ** 2;

  const disP1 = distanceOfPoints(circle, line1[0]);
  const disP2 = distanceOfPoints(circle, line1[1]);

  // const isInner = distanceA + distanceB <= distanceC;
  // const heightResult = line1Distance + line3Distance <= rectHeight;
  // console.log(
  //   JSON.stringify(
  //     {
  //       circle,
  //       isIn: disP1 < cd || disP2 < cd,
  //       isOut: d3 < cd,
  //       isInner: isCenterInsidePolygon(circle, rect),
  //     },
  //     null,
  //     2
  //   )
  // );
  // 判断线段与圆的位置关系: 1.如果两端点都在圆内，那么线段在圆内, 2.如果一个在圆内，一个在圆外，那么线段与圆相交
  if (disP1 < cd || disP2 < cd) {
    return true;
  }

  //3.如果两个端点都在圆外，那么计算圆心到线段的最小距离Hmin，如果Hmin小于半径，那么相交，否则线段在圆外。
  if (d3 < cd) {
    return true;
  }
  // 问题B：判断圆心与矩形的位置关系。如下所示有两种情况，可以通过计算圆心与端点之间夹角和来判断，等于360度则圆心在矩形内，小于360度则在矩形之外。

  return isCenterInsidePolygon(circle, rect);
}

// 计算两点之间的距离
function lineSpace(x1, y1, x2, y2) {
  let lineLength = 0;
  lineLength = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  return lineLength;
}

// 点到线段的距离
function pointToLine(
  { x: x0, y: y0 }: Point,
  [{ x: x1, y: y1 }, { x: x2, y: y2 }]: Line
) {
  let space = 0;
  let a, b, c;
  a = lineSpace(x1, y1, x2, y2); // 线段的长度
  b = lineSpace(x1, y1, x0, y0); // (x1,y1)到点的距离
  c = lineSpace(x2, y2, x0, y0); // (x2,y2)到点的距离
  if (c <= 0.000001 || b <= 0.000001) {
    space = 0;
    return space;
  }
  if (a <= 0.000001) {
    space = b;
    return space;
  }
  if (c * c >= a * a + b * b) {
    space = b;
    return space;
  }
  if (b * b >= a * a + c * c) {
    space = c;
    return space;
  }
  let p = (a + b + c) / 2; // 半周长
  let s = Math.sqrt(p * (p - a) * (p - b) * (p - c)); // 海伦公式求面积
  space = (2 * s) / a; // 返回点到线的距离（利用三角形面积公式求高）
  return space;
}

/**
 * 判断圆是否与矩形相交
 *
 * @export
 * @param {Circle} circle
 * @param {Rect} rect
 * @returns {Boolean}
 */
export default function circleIntersectRect(circle: Circle, rect: Rect) {
  const lines = getLinesByRect(rect);

  const { length } = lines;
  for (let index = 0; index < length; index++) {
    const line1 = lines[index];

    if (lineInCircle(circle, line1, rect)) {
      return true;
    }
  }
  return false;
}
