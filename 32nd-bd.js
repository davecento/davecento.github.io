// Creates the blank chart, which is filled automatically as soon as the createChart function is called. This needs to be created first so that we have universal variables to be changed later when the update function is called.
const scoresChart = document.getElementById('scoresChart');
const labels = 0
const data = {
    labels: labels,
    datasets: [{
        label: '32nd Breakdown',
        data: 0,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
    }]
};
const vertLine = new Chart(scoresChart, {
    type: 'bubble',
    data: data,
    options: {
        indexAxis: 'y',
        scales: {
            x: {
            }
        }
        }
    })

// createChart function retrieves game data, calculates fantasy points, and fills in the chart. 
// this is also called when inputs are changed and it recreates the chart with newly calculated data.

async function createChart() {
    
    const gameData = await d3.csv('2023 Season Data Formatted Ranked.csv');

    //retrieve fantasy score values from number spinners
    const rec = document.getElementById("rec").value
    const passTD = document.getElementById("passTD").value
    const rush1D = document.getElementById("rush1D").value
    const rec1D = document.getElementById("rec1D").value
    const fL = document.getElementById("fL").value
    const int = document.getElementById("int").value

    const startWeek = document.getElementById("startWeek").value
    const endWeek = document.getElementById("endWeek").value


    //Fantasy Score Values
    const recPoints = rec
    const ydsFrmScrimmagePoints = .1
    const passYdsPoints = .04
    const rush1DPoints = rush1D
    const rec1DPoints = rec1D
    const tDPoints = 6
    const passTDPoints = passTD
    const twoPtPoints = 2
    const fLPoints = fL
    const intPoints = int

    // Creating empty JavaScript Object to hold the game data. Each line will be a performance of a player on a given week (aka a "game").
    let games = {allGames:[], filteredGames:[]}
    
    // team number is used to determine the order displayed on the chart.
    teamNumbers = {'ARI': 1,
                    'ATL': 2,
                    'BAL': 3,
                    'BUF': 4,
                    'CAR': 5,
                    'CHI': 6,
                    'CIN': 7,
                    'CLE': 8,
                    'DAL': 9,
                    'DEN': 10,
                    'DET': 11,
                    'GB': 12,
                    'HOU': 13,
                    'IND': 14,
                    'JAX': 15,
                    'KC': 16,
                    'LV': 17,
                    'LAC': 18,
                    'LAR': 19,
                    'MIA': 20,
                    'MIN': 21,
                    'NE': 22,
                    'NO': 23,
                    'NYG':24,
                    'NYJ': 25,
                    'PHI': 26,
                    'PIT': 27,
                    'SF': 28,
                    'SEA': 29,
                    'TB': 30,
                    'TEN': 31,
                    'WAS': 32
                     }

    // run through each line of game data and calculate fantasy points. then add together for total score. each line added to games object under allGames

    gameData.forEach(row => {
        let fantasyPassYds = parseFloat(row.passYds) * passYdsPoints
        let fantasyPassTD = parseFloat(row.passTD) * passTDPoints
        let fantasyRushYds = parseFloat(row.rushYds) * ydsFrmScrimmagePoints
        let fantasyRush1D = parseFloat(row.rush1D) * rush1DPoints
        let fantasyRushTD = parseFloat(row.rushTD) * tDPoints
        let fantasyRecYds = parseFloat(row.recYds) * ydsFrmScrimmagePoints
        let fantasyRec1D = parseFloat(row.rec1D) * rec1DPoints
        let fantasyRecTD = parseFloat(row.recTD) * tDPoints
        let fantasyRec = parseFloat(row.rec) * recPoints
        let fantasy2pt = parseFloat(row.twoPM) * twoPtPoints
        let fantasyFmbLost = parseFloat(row.fmb) * fLPoints
        let fantasyInt = parseFloat(row.int) * intPoints
        let fantasyScore = fantasyPassYds + fantasyPassTD + fantasyRushYds + fantasyRush1D + fantasyRushTD + fantasyRecYds + fantasyRec1D + fantasyRecTD + fantasyRec + fantasy2pt + fantasyFmbLost + fantasyInt
        let teamNumber = teamNumbers[row.opp]

        let scores_json_row = {
            team:row.opp,
            player:row.player,
            positionRank:row.posRankFormatted,
            fantasyScore:fantasyScore,
            week:row.week,
            teamNumber:teamNumber
        }
        games.allGames.push(scores_json_row)
    })

    // functions used to sort by score and by team
    function sortByScore(a, b) {
        if (a.fantasyScore > b.fantasyScore) {
          return 1;
        } else if (a.fantasyScore < b.fantasyScore) {
          return -1;
        }
        // a must be equal to b
        return 0;
      }
      function sortByTeam(a, b) {
        if (a.team > b.team) {
          return 1;
        } else if (a.team < b.team) {
          return -1;
        }
        // a must be equal to b
        return 0;
      }  

    games.allGames.sort(sortByScore)
    
    // retrieve chart element in html
    const scoresChart = document.getElementById('scoresChart');
    
    //Position Selection and filtering
    positionPicker = document.getElementById("positionPicker")
    const filteredGames = games.allGames.filter(row => row.positionRank == positionPicker.value)
                            .filter(row => parseFloat(row.week) >= startWeek)
                            .filter(row => parseFloat(row.week) <= endWeek)
    filteredGames.forEach(row => games.filteredGames.push(row))
    
    //creating empty arrays which will be used for each game data point on the chart.
    const allScoreLabels = []
    const scores = []

    //go through game data and format in a way chartjs can use to create bubbles
    games.filteredGames.forEach(row => {
        const x = row.fantasyScore
        const y = row.teamNumber
        const r = 5
        scores.push({x:x, y:y, r:r})
        allScoreLabels.push(row.player + " (Week " + row.week +")")
    })
    const allScores = {
        label: 'Points Scored',
        data: scores,
        fill: false,
        borderColor: 'rgb(0, 0, 0)',
        labels: allScoreLabels,
        backgroundColor: "rgba(255, 255, 255, 1)",

        tooltip: {
            callbacks: {
                label: function(context) {
                    let label = context.dataset.labels[context.dataIndex] || '';

                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.x !== null) {
                        label += context.parsed.x.toFixed(2);
                    }
                    return label;
                }

            }
        }
    }
    
    // calculate the median and put it in the dataset structure

    const medians = []
    function getMedian(team) {
        if (team.length % 2) {
            return team[Math.floor(team.length / 2)].fantasyScore
        }else{
            let middleTop = team[(team.length / 2)]
            let middleBottom = team[(team.length / 2)-1]
            return (middleTop.fantasyScore + middleBottom.fantasyScore) / 2
        }
    }
    for (team in teamNumbers) {
        let teamScores = games.filteredGames.filter(row => row.team == team).sort(sortByScore)
        let median = getMedian(teamScores)
        medians.push({x:median, y:teamNumbers[team], r:15})
    }

    const medianScores = {
        label: 'Median',
        data: medians,
        fill: false,
        borderColor: 'rgb(0, 0, 0)',
        backgroundColor: "rgba(217, 217, 217, 1)",

        tooltip: {
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';

                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.x !== null) {
                        label += context.parsed.x.toFixed(2);
                    }
                    return label;
                }
            }
        }
    }

    // create new data and options objects to update the chart
    const new_data = {
        datasets: [allScores, medianScores]
    };
    
    // create annotations for the median scores
    const medianAnnotations = {}
    medians.forEach(team => {

        medianAnnotations[team.y] = {
            type: 'label',
            xValue: team.x,
            yValue: (team.y + 0.5),
            backgroundColor: 'rgba(0,0,0,0)',
            content: [team.x.toFixed(2)],
            font: {
            size: 18
            }
        }
    })

    const new_options = {
        indexAxis: 'y',
        scaleShowValues: true,
        scales: {
            x: {
            beginAtZero: false
            },
            y: {
                min:0,
                max:33,     
                ticks: {
                    callback: number => {
                        for (team in teamNumbers) {
                            if (teamNumbers[team] == number) {return team}
                            }
                        },
                    autoSkip: false,
                    maxTicksLimit:60
                    },
            },
        },
        hoverRadius:7,
        plugins:{
            annotation: {
                annotations: medianAnnotations
            }
        }
    }

    // update the data on the chart (from blank if it is the first time or from previous settings when something changes)
    vertLine.data = new_data
    vertLine.options = new_options
    vertLine.update()
}

createChart()