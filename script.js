const starredReposEl = document.getElementById('display-starred-repos');
const formInput = document.getElementById('profile-search');
const searchBtn = document.getElementById('search-btn');
const form = document.querySelector('form');

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

// searchUser('sonianb').then(console.log);

async function getStarredRepos(username) {
    const response = await fetch(`https://api.github.com/users/${username}/starred`)
    const starredRepos = await response.json();

    // console.log(starredReposName);

    const totalStarred = starredRepos.length;
    if (!response.ok) {
        const message = `Oops, something went wrong: ${response.status}`;
        throw new Error(message);
    }
    else {
        const newElem = document.createElement('div');
        newElem.innerText = `${username} has starred ${totalStarred} repositories:`
        starredReposEl.appendChild(newElem);

        starredRepos.forEach(starredRepo => {
            const newDiv = document.createElement('div');
            newDiv.innerText = starredRepo.full_name;
            starredReposEl.appendChild(newDiv);
        });
    }
}

searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchUser(formInput.value)
    getStarredRepos(formInput.value)
})


// getRepos('sonianb').then(console.log);