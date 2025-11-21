let dummyData = [];

module.exports = {
    getAll() {
        return dummyData;
    },

    create(newData) {
        dummyData.push(newData);
        return newData;
    }
};