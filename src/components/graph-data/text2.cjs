const fs = require('fs');
const path = require("path");

// Read the text file (assuming the file is named 'data.txt')
const filePath = path.join(__dirname, 'hadithGraphRawData.txt')
const rawData = fs.readFileSync(filePath, 'utf-8')

// Split the content into lines
const rows = rawData.split('\n');

// Initialize the result object
const resultArray = {}

// Process each line
for (const row of rows) {
    const [clusterId, groupId1, groupId2, idNumber1, idNumber2, hadith1, hadith2] = row.split('\t')

    if (!resultArray[clusterId]) {
        resultArray[clusterId] = {
            nodes: [],
            relations: []
        }
    }

    // Check if the groupId-1 and hadith-1 combination already exists
    const existingNode1 = resultArray[clusterId].nodes.find(node => Number(node['groupId-1']) === Number(groupId1) && node['hadith-1'] === hadith1)
    if (!existingNode1) {
        resultArray[clusterId].nodes.push({
            'groupId': groupId1,
            'hadith': hadith1
        })
    }

    // Check if the groupId-2 and hadith-2 combination already exists
    const existingNode2 = resultArray[clusterId].nodes.find(node => Number(node['groupId-2']) === Number(groupId2) && node['hadith-2'] === hadith2)
    if (!existingNode2) {
        resultArray[clusterId].nodes.push({
            'groupId': groupId2,
            'hadith': hadith2
        })
    }

    // Add relation (assuming you have 'from' and 'to' values)
    resultArray[clusterId].relations.push({
        from: groupId1,
        to: groupId2
    })
}

console.log(resultArray['3080']) // Display the final result
