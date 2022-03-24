// *************
// * Selectors *
// *************
const userPhoto = document.getElementById('user-photo');
const dateJoined = document.getElementById('date-joined');
const nameUser = document.getElementById('usersname');
const userFollowers = document.getElementById('user-followers');
const userFollowing = document.getElementById('user-following');
const userLocation = document.getElementById('user-location');
const userPublicRepos = document.getElementById('public-repos');
const userProfileUrl = document.getElementById('profile-url')

const starredReposEl = document.getElementById('starred-repos');
const formInput = document.getElementById('profile-search');
const searchBtn = document.getElementById('search-btn');

const myChart = document.getElementById('myChart').getContext('2d');
const languageChart = document.getElementById('languageChart').getContext('2d');
const recentActivityDate = document.getElementById('recent-activity-date');
const recentActivitiyMessage = document.getElementById('activity-message');

const errorOutput = document.getElementById('error-output');

let activityPieChart;
let languageBarChart;

// *****************
// * Functionality *
// *****************

async function callGithubAPI(apiUrl) {
    return await fetch('https://api.github.com' + apiUrl, {
        headers: {
            authorization: "token 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"
        }
    })
}

async function searchUser(username) {
    errorOutput.innerHTML = "";
    const response = await callGithubAPI(`/users/${username}`)
    const usernameData = await response.json();
    console.log(usernameData);
    if (!response.ok) {
        const message = `Oops, something went wrong: ${response.status}`;
        errorOutput.innerText = `Can't find ${username}. Try again.`
        throw new Error(message);
    }
    else {
        nameUser.innerText = `Name: ${usernameData.name}`
        dateJoined.innerText = `Joined: ${new Date(usernameData.created_at).toLocaleDateString()}`
        userPhoto.src = usernameData.avatar_url;
        userFollowers.innerText = `Followers: ${usernameData.followers}`
        userFollowing.innerText = `Following: ${usernameData.following}`
        userLocation.innerText = `Location: ${usernameData.location}`
        userPublicRepos.innerText = `Public repos: ${usernameData.public_repos}`
        userProfileUrl.setAttribute('href', usernameData.html_url);
    }
}

searchUser('sonianb').then(() => console.log);

async function getStarredRepos(username) {
    const response = await callGithubAPI(`/users/${username}/starred`)
    const starredRepos = await response.json();

    const totalStarred = starredRepos.length;
    if (!response.ok) {
        const message = `Oops, something went wrong: ${response.status}`;
        throw new Error(message);
    }
    else {
        starredReposEl.innerHTML = "";
        const numberReposContainer = document.createElement('div');
        numberReposContainer.innerText = `${username} has starred ${totalStarred} repositories`
        starredReposEl.appendChild(numberReposContainer);

        starredRepos.forEach(starredRepo => {
            const starredRepoDescription = document.createElement('p');
            starredRepoDescription.innerText = starredRepo.description;
            starredReposEl.appendChild(starredRepoDescription);

            const starredReposLink = document.createElement('a');
            starredReposLink.innerText = starredRepo.full_name;
            starredReposLink.setAttribute('href', starredRepo.html_url)
            starredReposEl.appendChild(starredReposLink);
        });
    }
}

async function recentActivity(username) {
    const response = await callGithubAPI(`/users/${username}/events?per_page=100`)
    const eventsData = await response.json();

    if (!response.ok) {
        const message = `Oops, something went wrong: ${response.status}`;
        throw new Error(message);
    }
    else {
        return eventsData;
    }
}

async function reposPerLanguage(username) {
    const response = await callGithubAPI(`/users/${username}/repos`)
    const reposData = await response.json();
    if (!response.ok) {
        const message = `Oops, something went wrong: ${response.status}`;
        throw new Error(message);
    }
    else {
        const counts = {};
        reposData.map(repo => repo.language)
            .filter(language => language)
            .forEach(x => {
                counts[x] = (counts[x] || 0) + 1
            });
        barChart(counts);
        return counts;
    }
}

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchUser(formInput.value)
    getStarredRepos(formInput.value)
    reposPerLanguage(formInput.value)
    recentActivity(formInput.value).then((eventsData) => createPieChart(eventsData))
})

// recentActivity('sonianb').then((eventsData) => createPieChart(eventsData));

// **********
// * Charts *
// **********

function createPieChart(eventList) {
    recentActivitiyMessage.innerHTML = "";
    if (eventList === undefined || eventList.length === 0) { //clear output if eventList is empty or doesn't exist
        activityPieChart.destroy();
        recentActivityDate.innerText = "";
        return recentActivitiyMessage.innerText = "No recent activity found :("
    }

    let lastElem = eventList.slice(-1)
    let lastElemDate = new Date(lastElem[0].created_at);
    recentActivityDate.innerText = `This is the recent activity, starting from ${lastElemDate.toLocaleDateString()}.`

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
    activityPieChart = new Chart(myChart, config)
    //need to destroy charts after wrong username input 
};

function barChart(counts) {
    const config = {
        type: 'bar',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: 'Repos per Language',
                data: Object.values(counts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        },
    }

    if (languageBarChart) {
        languageBarChart.destroy()
    }
    languageBarChart = new Chart(languageChart, config)
}
