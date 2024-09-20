import dataList from './tree.json' assert { type: "json" };

export default function findNodesByKey(data, targetKey) {
    // Find the target item by key
    const targetItem = data.find(item => item.key === targetKey);

    if (!targetItem) {
        return [];  // Return an empty array if the item is not found
    }

    const result = [];

    // Extract PathIdList and ChildrenIds of the target item
    const pathIds = targetItem.PathIdList.split(',').map(Number);
    const childIds = targetItem.ChildrenIds ? targetItem.ChildrenIds.split(',').map(Number) : [];

    // Filter items where:
    // 1. Any number in PathIdList equals the parent of another item
    // 2. Any number in ChildrenIds matches the key of another item
    data.forEach(item => {
        const itemChildrenIds = item.ChildrenIds ? item.ChildrenIds.split(',').map(Number) : [];

        // Check if parent is in PathIdList or key is in ChildrenIds
        const isParentInPathIdList = pathIds.includes(item.parent);
        const isKeyInChildrenIds = childIds.includes(item.key);

        if (isParentInPathIdList || isKeyInChildrenIds) {
            result.push({
                key: item.key,
                parent: item.parent,
                title: item.title,
                ChildrenIds: item.ChildrenIds,
            });
        }
    });

    result.forEach(item => {
        const childrenKeys = item.ChildrenIds ? item.ChildrenIds.split(',').map(Number) : [];
        childrenKeys.forEach(childKey => {
            // Finding child Item based on key
            const childNode = data.find(d => d.key === childKey);
            if (childNode && !result.some(r => r.key === childKey)) { // Preventing repetition
                result.push({
                    key: childNode.key,
                    parent: childNode.parent,
                    title: childNode.title,
                    ChildrenIds: childNode.ChildrenIds,
                });
            }
        });
    });

    // adding the root node to the first of the result
    result.unshift({
        key: 3,
        parent: 'null',
        title: "آدم ابو البشر (عليه السلام)"
    });

    // remove the ChildrenIds from the result this is optional!
    return result.map(item => ({
        key: item.key,
        parent: item.parent,
        title: item.title
    }));

    // return result
}

const targetKey = 60;
const matchingItems = findNodesByKey(dataList, targetKey);
console.log(matchingItems);
