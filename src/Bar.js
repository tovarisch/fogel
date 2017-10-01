var util = require("util");

var Bar = function Bar(barData) {
    if (!barData.__name) {
        throw new Error("No name field in Bar: " + util.inspect(barData));
    }
}

module.exports = Bar;