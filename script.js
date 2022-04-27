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
const formEl = document.getElementById('profile-search');
const formInputEl = document.getElementById('profile-search-input');
const barContainer = document.getElementById('bar-container');
const recentActivityDate = document.getElementById('recent-activity-date');
const recentActivitiyMessage = document.getElementById('activity-message');
const languagesMessage = document.getElementById('languages-message');

const myChart = document.getElementById('myChart').getContext('2d');
const languageChart = document.getElementById('languageChart').getContext('2d');
const doughnutChartCanvas = document.getElementById('doughnutChart').getContext('2d');

const listOfRepos = document.getElementById('list-of-repos');
const errorOutput = document.getElementById('error-output');
const collapseComponents = document.getElementsByClassName('collapse-component');


// *****************
// * Functionality *
// *****************

async function callGithubAPI(apiUrl) {
    const options = window.token ? {
        headers: {
            authorization: token
        }
    } : {};

    const response = await fetch('https://api.github.com' + apiUrl, options);
    if (response.status === 404) {
        throw new Error('User not found. Try again.');
    }
    if (response.status === 403) {
        throw new Error('403 Access Forbidden. You might have to try again in an hour.');
    }
    if (!response.ok) {
        throw new Error(`Oops, something went wrong: ${response.status}.`);
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
        const [userData] = await Promise.all([callGithubAPI(`/users/${username}`), timer]);
        showUserInformation(userData);
        getStarredRepos(username);
        reposPerLanguage(username);
        recentActivity(username);
        showRepos(username);
    } catch (error) {
        errorOutput.innerText = error.message;
        userInformation.classList.add('hide');
        loader.classList.add('hide');
    }
}

function showUserInformation(userData) {
    loader.classList.add('hide');
    userInformation.classList.remove('hide');
    userTitle.innerText = `User Information`
    nameUser.innerText = `Name: ${userData.name}`
    dateJoined.innerText = `Joined: ${new Date(userData.created_at).toLocaleDateString()}`
    userPhoto.src = userData.avatar_url;
    userFollowers.innerText = `Followers: ${userData.followers}`
    userFollowing.innerText = `Following: ${userData.following}`
    userPublicRepos.innerText = `Public repos: ${userData.public_repos}`
    userProfileUrl.setAttribute('href', userData.html_url);
    if (userData.location) {
        userLocation.innerText = `Location: ${userData.location}`
    } else {
        userLocation.innerText = "";
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
    const eventsData = await callGithubAPI(`/users/${username}/events`)
    createPieChart(eventsData);
}

function displayActivityDate(eventList) {
    recentActivitiyMessage.innerHTML = "";
    if (eventList === undefined || eventList.length === 0) { //clear output if eventList is empty or doesn't exist
        return recentActivitiyMessage.innerText = "No recent activity found :("
    }

    let lastElem = eventList.slice(-1)
    let lastElemDate = new Date(lastElem[0].created_at);
    recentActivityDate.innerText = `GitHub activity since ${lastElemDate.toLocaleDateString()}`
}

async function reposPerLanguage(username) {
    const reposData = await callGithubAPI(`/users/${username}/repos`)
    const counts = {};
    reposData.map(repo => repo.language)
        .filter(language => language)
        .forEach(x => {
            counts[x] = (counts[x] || 0) + 1
        });
    createBarChart(counts);

    languagesMessage.innerHTML = "";
    if (reposData === undefined || reposData.length === 0) {
        return recentActivitiyMessage.innerText = "No information found :("
    }
    let lastElem = reposData.slice(-1)[0]
    let lastElemDate = new Date(lastElem.created_at);
    languagesMessage.innerText = `Repos per Language used since ${lastElemDate.toLocaleDateString()}`
}

async function showRepos(username) {
    if (doughnutChart) {
        doughnutChart.destroy()
    }
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
}

formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    searchUser(formInputEl.value);

})

Array.from(collapseComponents).forEach(component => {
    component.addEventListener("click", function () {
        this.classList.toggle("active");
        this.nextElementSibling.classList.toggle('hide');
    });
});