// *************
// * Selectors *
// *************
const loader = document.getElementById('loader-container');
const userInformation = document.getElementById('user-information')
const userPhoto = document.getElementById('user-photo');
const dateJoined = document.getElementById('date-joined');
const nameUser = document.getElementById('usersname');
const userFollowers = document.getElementById('user-followers');
const userFollowing = document.getElementById('user-following');
const userLocation = document.getElementById('user-location');
const userPublicRepos = document.getElementById('public-repos');
const userProfileUrl = document.getElementById('profile-url');
const userTitle = document.getElementById('user-title')

const starredReposEl = document.getElementById('starred-repos');
const formInput = document.getElementById('profile-search');
const searchBtn = document.getElementById('search-btn');

const myChart = document.getElementById('myChart').getContext('2d');
const languageChart = document.getElementById('languageChart').getContext('2d');
const barContainer = document.getElementById('bar-container');
const recentActivityDate = document.getElementById('recent-activity-date');
const recentActivitiyMessage = document.getElementById('activity-message');
const languagesMessage = document.getElementById('languages-message');

const doughnutChartCanvas = document.getElementById('doughnutChart').getContext('2d');

const listOfRepos = document.getElementById('list-of-repos');

const errorOutput = document.getElementById('error-output');
const collapseRepos = document.getElementsByClassName('collapse-repos');
const collapseStarred = document.getElementsByClassName('collapse-starred')

let activityPieChart;
let languageBarChart;
let doughnutChart;

// *****************
// * Functionality *
// *****************

async function callGithubAPI(apiUrl) {
    const response = await fetch('https://api.github.com' + apiUrl, {
        headers: {
            authorization: token
        }
    });
    if (!response.ok) {
        throw new Error('Something went wrong ' + response.status);
    }
    return await response.json();
}

async function searchUser(username) {
    loader.classList.remove('hide');
    userInformation.classList.add('hide')
    errorOutput.innerHTML = "";
    try {
        const timer = new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
        const [usernameData] = await Promise.all([callGithubAPI(`/users/${username}`), timer]);
        loader.classList.add('hide');
        userInformation.classList.remove('hide');
        userTitle.innerText = `User Information`
        nameUser.innerText = `Name: ${usernameData.name}`
        dateJoined.innerText = `Joined: ${new Date(usernameData.created_at).toLocaleDateString()}`
        userPhoto.src = usernameData.avatar_url;
        userFollowers.innerText = `Followers: ${usernameData.followers}`
        userFollowing.innerText = `Following: ${usernameData.following}`
        userPublicRepos.innerText = `Public repos: ${usernameData.public_repos}`
        userProfileUrl.setAttribute('href', usernameData.html_url);
        if (usernameData.location) {
            userLocation.innerText = `Location: ${usernameData.location}`
        } else {
            userLocation.innerText = "";
        }
        getStarredRepos(username);
        reposPerLanguage(username);
        recentActivity(username);
        showRepos(username);
    } catch (error) {
        userInformation.classList.add('hide');
        errorOutput.innerText = `Can't find ${username}. Try again.`
    }
}

async function getStarredRepos(username) {
    const starredRepos = await callGithubAPI(`/users/${username}/starred`)
    const totalStarred = starredRepos.length;
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

async function recentActivity(username) {
    const eventsData = await callGithubAPI(`/users/${username}/events?per_page=100`)
    createPieChart(eventsData);
}

async function reposPerLanguage(username) {
    const reposData = await callGithubAPI(`/users/${username}/repos?per_page=20`)
    const counts = {};
    reposData.map(repo => repo.language)
        .filter(language => language)
        .forEach(x => {
            counts[x] = (counts[x] || 0) + 1
        });
    barChart(counts);

    languagesMessage.innerHTML = "";
    if (reposData === undefined || reposData.length === 0) {
        return recentActivitiyMessage.innerText = "No information found :("
    }
    let lastElem = reposData.slice(-1)
    let lastElemDate = new Date(reposData[0].created_at);
    languagesMessage.innerText = `Repos per Language used since ${lastElemDate.toLocaleDateString()}.`
}

async function showRepos(username) {
    const sortedRepos = await callGithubAPI(`/users/${username}/repos?sort=pushed`);
    listOfRepos.innerText = "";
    sortedRepos.forEach(sortedRepo => {
        const pElem = document.createElement('p');
        pElem.innerText = sortedRepo.name;
        listOfRepos.appendChild(pElem);
        pElem.addEventListener('click', () => contributorsPerRepo(username, sortedRepo.name));
    })
}

async function contributorsPerRepo(username, repo) {
    const contributorsData = await callGithubAPI(`/repos/${username}/${repo}/contributors`);
    const names = contributorsData.map(contributor => contributor.login);
    const contributions = contributorsData.map(num => num.contributions);
    createDoughnutChart(names, contributions);
    // console.log(contributorsData.map(contributor => ({name: contributor.login, amount: contributor.contributions})));
}

formInput.addEventListener('keyup', (event) => {
    if (event.key === 13) {
        searchBtn.click();
    }
})

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchUser(formInput.value);
})

searchBtn.classList.add('hide');

collapseRepos[0].addEventListener("click", function () {
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
});

collapseStarred[0].addEventListener("click", () => {
    collapseStarred[0].classList.toggle("active");
    let content = collapseStarred[0].nextElementSibling;
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
});

// **********
// * Charts *
// **********

function createPieChart(eventList) {
    recentActivitiyMessage.innerHTML = "";
    if (eventList === undefined || eventList.length === 0) { //clear output if eventList is empty or doesn't exist
        return recentActivitiyMessage.innerText = "No recent activity found :("
    }

    let lastElem = eventList.slice(-1)
    let lastElemDate = new Date(lastElem[0].created_at);
    recentActivityDate.innerText = `Recent activity since ${lastElemDate.toLocaleDateString()}.`

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
                label: 'Recent Activity',
                data: [
                    nbPullRequests,
                    nbIssuesOpened,
                    commitsTotal
                ],
                backgroundColor: [
                    '#71AB64',
                    '#6663AB',
                    '#ABA8F7'
                ],
                hoverOffset: 2
            }]
        }
    }
    if (activityPieChart) {
        activityPieChart.destroy();
    }
    activityPieChart = new Chart(myChart, config)
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
                    '#71AB64',
                    '#ABA8F7',
                    '#6663AB',
                    '#A3F78F'
                ],
                borderColor: [
                    '#71AB64',
                    '#ABA8F7',
                    '#6663AB',
                    '#A3F78F'
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

//generate a new chart every time the user clicks on a repo
function createDoughnutChart(names, contributions) {
    const config = {
        type: 'doughnut',
        data: {
            labels: names,
            datasets: [{
                label: 'My First Dataset',
                data: contributions, //num of contributions
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ],
                hoverOffset: 4
            }]
        }
    };

    if (doughnutChart) {
        doughnutChart.destroy()
    }
    doughnutChart = new Chart(doughnutChartCanvas, config)
};
