var util = require("util");

var List = function List(listData) {
    if (!listData.__name) {
        throw new Error("No name field in Type: " + util.inspect(listData));
    }

    this.name       = listData.__name;
    this.fields     = {};
    this.__listData = listData;
};

List.prototype.settleReferences = function settleReferences() {

};

module.exports = List;