const starredReposEl = document.getElementById('display-starred-repos');
const formInput = document.getElementById('profile-search');
const searchBtn = document.getElementById('search-btn');

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


// getRepos('sonianb').then(console.log);