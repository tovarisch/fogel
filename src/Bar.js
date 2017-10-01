var util = require("util");

var Bar = function Bar(barData) {
    if (!barData.__options__) {
        throw new Error("No options field in Bar: " + util.inspect(barData));
    }
}

module.exports = Bar;