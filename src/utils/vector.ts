import type { Vector } from '../types/game';

export class Vector2D implements Vector {
  constructor(public x: number, public y: number) {}

  add(v: Vector): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector): Vector2D {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  mult(n: number): Vector2D {
    return new Vector2D(this.x * n, this.y * n);
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  norm(): Vector2D {
    const m = this.mag();
    return m === 0 ? new Vector2D(0, 0) : new Vector2D(this.x / m, this.y / m);
  }

  dist(v: Vector): number {
    return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
  }
}

export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

export function getAngleDiff(a: number, b: number): number {
  return Math.atan2(Math.sin(b - a), Math.cos(b - a));
}

