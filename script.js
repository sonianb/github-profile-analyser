const starredReposEl = document.getElementById('display-starred-repos')

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

async function getRepos(username) {
    const response = await fetch(`https://api.github.com/users/${username}/starred`)
    const starredRepos = await response.json();

    const starredReposName = starredRepos.forEach(starredRepo => {
        const newDiv = document.createElement('div');
        newDiv.innerText = starredRepo.name;
        starredReposEl.appendChild(newDiv);
    });

    console.log(starredReposName);

    const totalStarred = starredRepos.length;
    if (!response.ok) {
        const message = `Oops, something went wrong: ${response.status}`;
        throw new Error(message);
    }
    else {
        return `${username} has starred ${totalStarred} repos: 
        `;
    }
}

getRepos('kmj673 ').then(console.log);