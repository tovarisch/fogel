var lodash            = require("lodash");
var fs                = require("fs");
var os                = require("os");
var colors            = require("colors");
var path              = require("path");
var util              = require("util");

var Type = require("./Type.js");
var Bar = require("./Bar.js");

module.exports = {
    lists: {},

    types: {},

    bars: {},

    outputPath: "",

    addList: function (listData) {
        if (!listData.__name) {
            throw new Error("No name specified in list");
        }

        this.lists[listData.__name] = listData;
    },

    addType: function (typeData) {
        this.prototypes[prototype.name] = new Type(typeData);
    },

    addBar: function (barData) {
        this.prototypes[prototype.name] = new Type(barData);
    },

    generateSource: function () {

    }
};
