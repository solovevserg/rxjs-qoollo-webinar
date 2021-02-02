const { Observable, Subject } = rxjs;

function main() {
    const subject = new Subject();

    const observable = subject.asObservable();
    observable.subscribe((a) => console.log('7', a));
    
    // Can emit new values
    subject.next(1)
    subject.next(2)
    subject.next(4)
    
    observable.subscribe((a) => console.log('14', a));
    
    subject.next(6)
    console.log('17')
}

main();