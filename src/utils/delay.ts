import {
  PRIORITY_DEFAULT,
  SOURCE_REMOVE,
  timeout_add,
  Source,
} from "@gi-types/glib2";

let timeoutSourceIds: number[] | null = [];

export function delay(milliseconds: number) {
  return new Promise((resolve) => {
    const timeoutId = timeout_add(PRIORITY_DEFAULT, milliseconds, () => {
      removeFinishedTimeoutId(timeoutId);
      resolve(undefined);

      return SOURCE_REMOVE;
    });

    if (!timeoutSourceIds) {
      timeoutSourceIds = [];
    }
    timeoutSourceIds.push(timeoutId);
  });
}

function removeFinishedTimeoutId(timeoutId: number) {
  timeoutSourceIds?.splice(timeoutSourceIds.indexOf(timeoutId), 1);
}

export function disposeDelayTimeouts() {
  timeoutSourceIds?.forEach((sourceId) => {
    Source.remove(sourceId);
  });

  timeoutSourceIds = null;
}
