var util = require("util");

var Table = function Table(tableData) {
    if (!tableData.__name) {
        throw new Error("No name field in Type: " + util.inspect(tableData));
    }

    this.name       = tableData.__name;
    this.fields     = {};
    this.__tableData = tableData;
};

Table.prototype.settleReferences = function settleReferences() {

};

module.exports = Table;