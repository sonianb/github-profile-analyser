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

searchUser('sonianb');