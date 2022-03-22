const starredReposEl = document.getElementById('display-starred-repos');
const formInput = document.getElementById('profile-search');
const searchBtn = document.getElementById('search-btn');
const myChart = document.getElementById('myChart').getContext('2d');
const recentActivityDate = document.getElementById('recent-activity-date')
let activityPieChart;

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
    recentActivity(formInput.value).then((eventsData) => createPieChart(eventsData))
})

async function recentActivity(username) {
    const response = await fetch(`https://api.github.com/users/${username}/events?per_page=100`)
    const eventsData = await response.json();

    if (!response.ok) {
        const message = `Oops, something went wrong: ${response.status}`;
        throw new Error(message);
    }
    else {
        return eventsData;
    }
}


// recentActivity('sonianb').then((eventsData) => createPieChart(eventsData));

function createPieChart(eventList) {
    //check if eventlist exists and is not empty
    let lastElem = eventList.slice(-1)
    let lastElemDate = new Date(lastElem[0].created_at);
    recentActivityDate.innerText = `This is the recent activity, starting from ${lastElemDate.toLocaleDateString()}.`

    console.log(eventList);

    let counter = 0;
    eventList.forEach(event => {
        if (event.type === "PullRequestEvent") {
            counter++
        }
    });
    const nbPullRequests = counter;

    const nbIssuesTotal = eventList.filter(event => event.type === 'IssuesEvent');
    const nbIssuesOpened = nbIssuesTotal.filter(event => event.payload.action === "opened").length;

    const pushEvents = eventList.filter(event => event.type === "PushEvent");

    let commitsTotal = 0;
    pushEvents.forEach(pushEvent => {
        let commitSize = pushEvent.payload.size;
        commitsTotal = commitSize + commitsTotal;
    })

    const config = {
        type: 'pie',
        data: {
            labels: [
                'Pull Requests',
                'Issues Opened',
                'Commits'],
            datasets: [{
                label: 'Population',
                data: [
                    nbPullRequests,
                    nbIssuesOpened,
                    commitsTotal
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

    if (activityPieChart) {
        activityPieChart.destroy()
    }
    activityPieChart = new Chart(myChart, config)
};
