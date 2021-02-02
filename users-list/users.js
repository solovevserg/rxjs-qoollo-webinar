const { fromEvent, operators, combineLatest, of, Subject } = rxjs;
const { map, filter, distinctUntilChanged, debounceTime, switchMap, startWith, tap } = operators;

async function loadUsers(query) {
    const url = `https://sdal.pw/api/cdc/users?query=${query}`;
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

function filterUsers(users, verified, query = '') {
    if (verified) {
        users = users.filter(u => !verified || u.verified === verified);
    }
    if (query) {
        users = users.filter(u => u.name.toLowerCase().includes(query));
    }
    return users;
}

function registerSearchHandler() {
    combineLatest([
        fromEvent(state.elems.verified, 'input').pipe(
            map(event => event.target.checked),
            startWith(false)
        ),
        fromEvent(state.elems.query, 'input').pipe(
            map(event => event.target.value),
            startWith(''),
        )
    ]).pipe(
        // Дожидаемся, пока пользователь перестанет барабанить по клавиатуре
        debounceTime(300),
        // Проверяем, что запрос изменился, иначе нет смысла искать заново
        distinctUntilChanged(compareQueries),
        // Дожидаемся получения списка пользователей и "протаскиваем" параметр verified
        // для дальнейшей работы
        switchMap(([verified, query]) => Promise.all([
            loadUsers(query),
            verified
        ])),
        map(([users, verified]) => filterUsers(users, verified)),
    ).subscribe(renderUsers)
}

async function main() {
    registerSearchHandler();
}

main();