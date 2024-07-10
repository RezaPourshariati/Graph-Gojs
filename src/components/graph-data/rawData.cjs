const fs = require('fs')
const path = require('path')

// Read the file (assuming it's called 'data.txt' and located in the same directory)
const filePath = path.join(__dirname, 'hadithGraphRawData.txt')
const rawData = fs.readFileSync(filePath, 'utf-8')

// Split the raw data into rows and then columns
const rows = rawData.split('\n')

// console.log(rows)

const resultArray = {}

rows.forEach(row => {
    const columns = row.split('\t')

    // console.log(columns[0])

    const clusterId = columns[0]
    const groupId1 = columns[1]
    const groupId2 = columns[2]
    // const idNumber1 = columns[3]
    // const idNumber2 = columns[4]
    const hadith1 = columns[5]
    const hadith2 = columns[6]

    if (!resultArray[clusterId]) {
        resultArray[clusterId] = {
            nodes: [],
            relations: []
        }
    }

    // Check for duplicate nodes
    const nodeExists = resultArray[clusterId].nodes.some(node =>
        node["groupId-1"] === Number(groupId1) &&
        node["groupId-2"] === Number(groupId2) &&
        node["hadith-1"] === hadith1 &&
        node["hadith-2"] === hadith2
    )

    if (!nodeExists) {
        resultArray[clusterId].nodes.push({
            "groupId-1": groupId1,
            "groupId-2": groupId2,
            "hadith-1": hadith1,
            "hadith-2": hadith2
        })
    }

    // Check for duplicate relations
    const relationExists = resultArray[clusterId].relations.some(relation =>
        relation["from"] === groupId1 &&
        relation["to"] === groupId2
    )

    if (!relationExists) {
        resultArray[clusterId].relations.push({
            "from": groupId1,
            "to": groupId2
        })
    }
})

console.log(resultArray['3'].nodes.length)
