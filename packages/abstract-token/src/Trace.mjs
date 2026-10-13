const FRAME_LIST = [];

export function enter(target, newTarget) {
  FRAME_LIST.push({ target, newTarget });
}

export function leave() {
  FRAME_LIST.pop();
}

export function current() {
  return FRAME_LIST.at(-1) ?? null;
}

export function depth() {
  return FRAME_LIST.length;
}
