const { fromEvent, operators, combineLatest, of, Subject } = rxjs;
const { map, filter, distinctUntilChanged, debounceTime, switchMap, startWith } = operators;

async function loadUsers() {
    const url = 'https://sdal.pw/api/cdc/users';
    const users = await fetch(url, { mode: 'cors' }).then(r => r.json());
    return users;
}

const state = {
    users: [],
    elems: {
        query: document.getElementById('query'),
        verified: document.getElementById('verified'),
        usersList: document.getElementById('users-list'),
    }
}

function createUserLi(user) {
    const li = document.createElement('li');
    const prefix = user.verified ? '✔' : ''
    li.innerText = `${prefix} ${user.name} (${user.age})`;
    return li;
}

function createUsersListHtml(users) {
    return users.map(createUserLi).map(li => li.outerHTML).join('')
}

function renderUsers(users) {
    html = createUsersListHtml(users);
    state.elems.usersList.innerHTML = html;
}

function compareQueries(a, b) {
    for (const key in a) {
        if (Object.hasOwnProperty.call(a, key)
            && a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}

function filterUsers(users, verified, query) {
    return users
        .filter(u => !verified || u.verified === verified)
        .filter(u => u.name.toLowerCase().includes(query));
}

function registerSearchHandler(usersObservable) {
    combineLatest([
        combineLatest([
            fromEvent(state.elems.verified, 'input').pipe(
                map(event => event.target.checked),
                startWith(false)
            ),
            fromEvent(state.elems.query, 'input').pipe(
                map(event => event.target.value),
                map(query => query.toLowerCase()),
                startWith(''),
            )
        ]).pipe(
            debounceTime(300),
            distinctUntilChanged(compareQueries),
        ),
        usersObservable]).pipe(
            map(([[verified, query], users]) => filterUsers(users, verified, query))
        ).subscribe(renderUsers)
}

async function main() {
    const users = await loadUsers();
    const subject = new Subject();
    registerSearchHandler(subject);
    subject.next(users);

}

main();