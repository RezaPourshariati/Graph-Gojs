const fs = require('fs');

const resultArray = {};

fs.readFile('hadithGraphRawData.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    const rows = data.split('\n');

    rows.forEach(row => {
        const [clusterId, groupId1, groupId2, idNumber1, idNumber2, hadith1, hadith2] = row.split('\t');

        if (!resultArray[clusterId]) {
            resultArray[clusterId] = {
                nodes: [],
                relations: []
            }
        }

        const existingNode1 = resultArray[clusterId].nodes.find(node => node.key === groupId1 && node.hadith === hadith1)
        const existingNode2 = resultArray[clusterId].nodes.find(node => node.key === groupId2 && node.hadith === hadith2)

        if (!existingNode1) {
            resultArray[clusterId].nodes.push({
                key: groupId1,
                hadith: hadith1
            });
        }

        if (!existingNode2) {
            resultArray[clusterId].nodes.push({
                key: groupId2,
                hadith: hadith2
            });
        }

        if (existingNode1 && existingNode2) {
            resultArray[clusterId].relations.push({
                "from": groupId1,
                "to": groupId2
            });
        }
    });

    console.log(resultArray['3080']);
});