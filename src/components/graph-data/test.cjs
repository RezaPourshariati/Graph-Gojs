const fs = require('fs')

// Read the raw data from the text file
const rawData = fs.readFileSync('hadithGraphRawData.txt', 'utf-8')

// Split the data by rows
const rows = rawData.trim().split('\n')

// Initialize the result object
const resultArray = {}

rows.forEach(row => {
    const [clusterId, groupId1, groupId2, idNumber1, idNumber2, hadith1, hadith2] = row.split('\t')

    if (!resultArray[clusterId]) {
        resultArray[clusterId] = {
            nodes: [],
            relations: []
        }
    }

    // Check if the row is already processed
    const exists = resultArray[clusterId].nodes.some(node => Number(node["groupId-1"]) === Number(groupId1) && Number(node["groupId-2"]) === Number(groupId2))

    if (!exists) {
        resultArray[clusterId].nodes.push({
            "groupId-1": Number(groupId1),
            "groupId-2": Number(groupId2),
            "hadith-1": hadith1,
            "hadith-2": hadith2
        })

        resultArray[clusterId].relations.push({
            "from": Number(idNumber1),
            "to": Number(idNumber2)
        })
    }
})

console.log(resultArray['3080'])