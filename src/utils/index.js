export const throttleDebounce = (func, delay) => {
  let isFirstCall = true;
  let throttleDebounceTimer = null;

  return function(...args) {
    const context = this;
    if (isFirstCall) {
      func.apply(context, args);
      isFirstCall = false;
    } else {
      if (throttleDebounceTimer !== null) {
        clearTimeout(throttleDebounceTimer);
      }
      throttleDebounceTimer = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    }
  };
};

