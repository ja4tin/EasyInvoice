export {};

declare global {
  interface PromiseConstructor {
    withResolvers<T>(): {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: unknown) => void;
    };
    try<T>(callback: () => T | PromiseLike<T>): Promise<T>;
  }
}

if (!Promise.withResolvers) {
  Promise.withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

if (!Promise.try) {
  Promise.try = function <T>(callback: () => T | PromiseLike<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        resolve(callback());
      } catch (e) {
        reject(e);
      }
    });
  };
}
