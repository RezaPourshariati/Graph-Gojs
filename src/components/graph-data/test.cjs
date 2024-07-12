// const fs = require('fs')
//
// // Read the raw data from the text file
// const rawData = fs.readFileSync('hadithGraphRawData.txt', 'utf-8')
//
// // Split the data by rows
// const rows = rawData.trim().split('\n')
//
// // Initialize the result object
// const resultArray = {}
//
// rows.forEach(row => {
//     const [clusterId, groupId1, groupId2, idNumber1, idNumber2, hadith1, hadith2] = row.split('\t')
//
//     if (!resultArray[clusterId]) {
//         resultArray[clusterId] = {
//             nodes: [],
//             relations: []
//         }
//     }
//
//     // Check if the row is already processed
//     const exists = resultArray[clusterId].nodes.some(node => Number(node["groupId-1"]) === Number(groupId1) &&
//         Number(node["groupId-2"]) === Number(groupId2))
//
//     if (!exists) {
//         resultArray[clusterId].nodes.push({
//             "groupId-1": Number(groupId1),
//             "groupId-2": Number(groupId2),
//             "hadith-1": hadith1,
//             "hadith-2": hadith2
//         })
//
//         resultArray[clusterId].relations.push({
//             "from": Number(idNumber1),
//             "to": Number(idNumber2)
//         })
//     }
// })
//
// console.log(resultArray['3080'])

// --------------------------------------------------------------------
// const fs = require('fs');
//
// fs.readFile('hadithGraphRawData.txt', 'utf8', (err, rawData) => {
//     if (err) {
//         console.error('Error reading the file', err);
//         return;
//     }
//
//     const resultArray = processData(rawData);
//
//     // console.log(JSON.stringify(result, null, 2));
//
//
//     function checkForDuplication(cluster) {
//         const clusterNumber = cluster.toString() // <---- receive string
//         const filteredNodes = resultArray[clusterNumber].nodes.filter((node, index) => {
//             const isDuplicate = resultArray[clusterNumber].nodes.findIndex((n) => n.key === node.key) !== index
//             return !isDuplicate
//         })
//
//         const filteredResult = {...resultArray[clusterNumber], nodes: filteredNodes}
//
//         // console.log(filteredResult.relations)
//
//         // let hadithData
//         // let relationHadithData
//         //
//         // hadithData = filteredResult.nodes
//         // relationHadithData = filteredResult.relations
//
//         // console.log(JSON.stringify(hadithData))
//         // console.log(JSON.stringify(relationHadithData))
//
//         console.log(filteredResult.nodes)
//         console.log(filteredResult.relations)
//
//         // return {...resultArray[clusterNumber], nodes: filteredNodes}
//     }
//
//     checkForDuplication(3080)
// })
//
// function processData(data) {
//     const rows = data.trim().split('\n');
//     const resultArray = {};
//
//     rows.forEach(row => {
//         const columns = row.split('\t');
//         const clusterId = columns[0];
//         const groupId1 = columns[1];
//         const groupId2 = columns[2];
//         const hadith1 = columns[5];
//         const hadith2 = columns[6];
//
//         if (!resultArray[clusterId]) {
//             resultArray[clusterId] = {
//                 nodes: [],
//                 relations: []
//             };
//         }
//
//         resultArray[clusterId].nodes.push({
//             key: groupId1,
//             hadith: hadith1
//         });
//
//         resultArray[clusterId].nodes.push({
//             key: groupId2,
//             hadith: hadith2
//         });
//
//         resultArray[clusterId].relations.push({
//             from: groupId1,
//             to: groupId2
//         });
//     });
//
//     // Remove duplicate nodes
//     // for (let clusterId in resultArray) {
//     //     const nodes = resultArray[clusterId].nodes;
//     //     resultArray[clusterId].nodes = nodes.filter((node, index) => {
//     //         const isDuplicate = nodes.findIndex((n, i) => n.key === node.key && n.hadith === node.hadith) !== index;
//     //         return !isDuplicate;
//     //     });
//     // }
//
//     return resultArray;
// } /]



const fs = require('fs');

fs.readFile('hadithGraphRawData.txt', 'utf8', (err, rawData) => {
    if (err) {
        console.error('Error reading the file', err)
        return
    }

    const resultArray = processData(rawData)
    checkForDuplication(resultArray, '3')
})

function processData(data) {
    const resultArray = {}

    data.trim().split('\n').forEach(row => {
        const columns = row.split('\t')

        const clusterId = columns[0]
        const hadith1 = columns[5]
        const hadith2 = columns[6]

        if (!resultArray[clusterId]) {
            resultArray[clusterId] = {
                nodes: new Set(),
                relations: []
            }
        }

        resultArray[clusterId].nodes.add({ key: columns[1], hadith: hadith1 })
        resultArray[clusterId].nodes.add({ key: columns[2], hadith: hadith2 })

        resultArray[clusterId].relations.push({ from: columns[1], to: columns[2] })
    });

    return resultArray
}

function checkForDuplication(resultArray, clusterNumber) {
    const cluster = resultArray[clusterNumber]
    if (!cluster) return

    const nodesMap = new Map()
    cluster.nodes.forEach(node => {
        nodesMap.set(node.key, node)
    })

    const filteredNodes = Array.from(nodesMap.values())
    const filteredResult = { ...cluster, nodes: filteredNodes }

    console.log(filteredResult.nodes.length)
    console.log(filteredResult.relations.length)
}