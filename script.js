const starredReposEl = document.getElementById('display-starred-repos');
const formInput = document.getElementById('profile-search');
const searchBtn = document.getElementById('search-btn');
const myChart = document.getElementById('myChart').getContext('2d');

async function searchUser(username) {
    const response = await fetch(`https://api.github.com/users/${username}`)
    const usernameData = await response.json();
    if (!response.ok) {
        const message = `Oops, something went wrong: ${response.status}`;
        throw new Error(message);
    }
    else {
        return usernameData;
    }
}

async function getStarredRepos(username) {
    const response = await fetch(`https://api.github.com/users/${username}/starred`)
    const starredRepos = await response.json();

    const totalStarred = starredRepos.length;
    if (!response.ok) {
        const message = `Oops, something went wrong: ${response.status}`;
        throw new Error(message);
    }
    else {
        starredReposEl.innerHTML = "";
        const numberReposContainer = document.createElement('div');
        numberReposContainer.innerText = `${username} has starred ${totalStarred} repositories:`
        starredReposEl.appendChild(numberReposContainer);

        starredRepos.forEach(starredRepo => {
            const starredReposLink = document.createElement('a');
            starredReposLink.innerText = starredRepo.full_name;
            starredReposLink.setAttribute('href', starredRepo.html_url)
            starredReposEl.appendChild(starredReposLink);
        });
    }
}

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchUser(formInput.value)
    getStarredRepos(formInput.value)
})

async function recentActivity(username) {
    const response = await fetch(`https://api.github.com/users/${username}/events`)
    const eventsData = await response.json();

    if (!response.ok) {
        const message = `Oops, something went wrong: ${response.status}`;
        throw new Error(message);
    }
    else {
        return eventsData;
    }
}


recentActivity('sonianb').then((eventsData) => createPieChart(eventsData));

function createPieChart(eventList) {
    console.log(eventList);
    let counter = 0;
    eventList.forEach(event => {
        if (event.type === "PullRequestEvent") {
            counter++
        }
    });
    const nbPullRequests = counter;
    const nbIssuesOpened = eventList.filter(event => event['payload'].action === "opened").length
    const nbPushes = eventList.filter(event => event.type === "PushEvent").length;

    const config = {
        type: 'pie',
        data: {
            labels: [
                'Pull Requests',
                'Issues Opened',
                'Pushes'],
            datasets: [{
                label: 'Population',
                data: [
                    nbPullRequests,
                    nbIssuesOpened,
                    nbPushes
                ],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ],
                hoverOffset: 20
            }]
        }
    }
    let activityPieChart = new Chart(myChart, config)
};

