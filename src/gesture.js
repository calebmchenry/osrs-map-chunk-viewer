/** A navigation gesture stays a navigation gesture until every pointer lifts. */
export class TapGuard {
  pointers = new Map();
  navigated = false;

  down(id, x, y) {
    if (this.pointers.size === 0) this.navigated = false;
    this.pointers.set(id, { x, y });
    if (this.pointers.size > 1) this.navigated = true;
  }

  move(id, x, y) {
    const start = this.pointers.get(id);
    if (start && Math.hypot(x - start.x, y - start.y) > 6) this.navigated = true;
  }

  up(id) {
    this.pointers.delete(id);
  }

  cancel(id) {
    this.navigated = true;
    this.up(id);
  }

  get canSelect() {
    return !this.navigated;
  }
}
