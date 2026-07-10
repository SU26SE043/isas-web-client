type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

export function clearUnauthorizedHandler() {
  unauthorizedHandler = null;
}

export function notifyUnauthorized() {
  unauthorizedHandler?.();
}
