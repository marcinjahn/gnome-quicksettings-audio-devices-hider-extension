export function delay(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(() => resolve(undefined), milliseconds);
    })
}

export function delaySync(milliseconds: number) {
    const startPoint = new Date().getTime();
    while (new Date().getTime() - startPoint <= milliseconds) { }
}