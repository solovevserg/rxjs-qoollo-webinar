const { Observable, Subject, interval, of } = rxjs;

function map(project) {
    return observable => Observable.create(observer => {
        observable.subscribe({
            next(value) {
                const projected = project(value);
                observer.next(projected)
            },
            error: err => observer.err(err),
            complete: () => observer.complete(),
        }); 
    })
}

function filter(predicate) {
    return observable => Observable.create(observer => {
        observable.subscribe({
            next(value) {
                const satisfies = predicate(value);
                if(satisfies) {
                    observer.next(value)
                }
            },
            error: err => observer.err(err),
            complete: () => observer.complete(),
        }); 
    })
}

function main() {
    interval(500).pipe(
        filter(i => i < 10),
        map(i => i**2),
        filter(i => i % 2 === 0),
    ).subscribe(console.log);

    of('123', 'abc', 'def', 'мама').pipe(
        map(str => str + str),
    ).subscribe(console.log);

}

main();