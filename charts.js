// **********
// * Charts *
// **********

let activityPieChart;
let languageBarChart;
let doughnutChart;

function createPieChart(eventList) {

    displayActivityDate(eventList);

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

function createBarChart(counts) {
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
                    '#71AB64',
                    '#6663AB',
                    '#A3F78F',
                    '#ABA8F7',
                    '#F7D5C1'
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
