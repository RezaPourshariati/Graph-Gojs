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
    const groupId1 = Number(columns[1])
    const groupId2 = Number(columns[2])
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
    // const nodeExists = resultArray[clusterId].nodes.some(node =>
    //     node["groupId-1"] === Number(groupId1) &&
    //     node["groupId-2"] === Number(groupId2) &&
    //     node["hadith-1"] === hadith1 &&
    //     node["hadith-2"] === hadith2
    // )

    // const nodeExists = resultArray[clusterId].nodes.find((node) => {
    //     return (node["groupId-1"] === groupId1 && node["hadith-1"] === hadith1) ||
    //         (node["groupId-2"] === groupId2 && node["hadith-2"] === hadith2)
    //
    // })

    // if (!nodeExists) {
    //     resultArray[clusterId].nodes.push({
    //         "groupId-1": groupId1,
    //         "groupId-2": groupId2,
    //         "hadith-1": hadith1,
    //         "hadith-2": hadith2
    //     })
    // }

    const existingNode1 = resultArray[clusterId].nodes.find(node => node.key === groupId1 && node.hadith === hadith1)
    const existingNode2 = resultArray[clusterId].nodes.find(node => node.key === groupId2 && node.hadith === hadith2)

    if (!existingNode1) {
        resultArray[clusterId].nodes.push({
            "key": groupId1,
            "hadith": hadith1
        });
    }

    if (!existingNode2) {
        resultArray[clusterId].nodes.push({
            "key": groupId2,
            "hadith": hadith2
        })
    }

    // const filteredNodes = resultArray[clusterId].nodes.filter((node, index) => {
    //     const isDuplicate = resultArray[clusterId].nodes.findIndex((n, i) => n.groupId === node.groupId && n.hadith === node.hadith) !== index;
    //     return !isDuplicate;
    // })

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

// console.log(resultArray['3080'])


function checkForDuplication(cluster) {
    let hadithData
    let relationHadithData
    const clusterNumber = cluster.toString() // <---- receive string
    const filteredNodes = resultArray[clusterNumber].nodes.filter((node, index) => {
        const isDuplicate = resultArray[clusterNumber].nodes.findIndex((n) => n.key === node.key) !== index
        return !isDuplicate
    })

    const filteredResult = {...resultArray[clusterNumber], nodes: filteredNodes}
    // console.log(filteredResult.relations)
    hadithData = filteredResult.nodes
    relationHadithData = filteredResult.relations

    console.log(JSON.stringify(hadithData))
    console.log(JSON.stringify(relationHadithData))


    // return {...resultArray[clusterNumber], nodes: filteredNodes}
}

checkForDuplication(3080)


module.exports = {hadithData, relationHadithData, checkForDuplication}
