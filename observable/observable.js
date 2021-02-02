const { Observable, empty } = rxjs;

function createTimer(ms = 1000, limit = Infinity) {
    if (limit < 1) {
        return empty();
    }
    let i = 0;
    const timer = Observable.create(observer => {
        const subscr = setInterval(() => {
            observer.next(i);
            i++;
            if (i === limit) {
                clearInterval(subscr);
                observer.complete();
            }
        }, ms);
    });
    return timer;
}

function main() {
    const timer = createTimer(500, 10);
    timer.subscribe({
        next: console.log,
        complete() { console.log('COMPLETE') }
    });

    timer.subscribe({
        next: console.log,
        complete() { console.log('COMPLETE') }
    });

    const emptyTimer = createTimer(500, 0);
    emptyTimer.subscribe({
        next: console.log,
        complete() { console.log('COMPLETE EMPTY') }
    });
}

main();