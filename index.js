var lo                    = require("lodash");
var async                 = require("async");
var colors                = require("colors");
var fs                    = require("fs");
var path                  = require("path");
var stripJsonComments     = require("strip-json-comments");
var argumentsParser       = require('command-line-args')
var argumentsDefinitions  = [
    { name: 'config', alias: 'c', type: String },
    { name: 'output', alias: 'o', type: String},
    { name: 'input', alias: 'i', type: String, multiple: true }
];

var Storage     = require("./src/Storage.js");
var Processor   = require("./src/Processor.js");
var Type = require("./src/entities/Type.js");
var Blank = require("./src/entities/Blank.js");
var Table = require("./src/entities/Table.js");

var gatherFiles = function (folderPath, callback) {
    var tablesFiles  = [];
    var typesFiles  = [];
    var blanksFiles   = [];

    async.waterfall([
        function (next) {
            fs.readdir(folderPath, next);
        },
        function (files, next) {
            async.forEach(files, function (fileName, next) {
                var filePath = path.join(folderPath, fileName);

                fs.stat(filePath, function(error, stat) {
                    if(error) {
                        next(error);
                        return;
                    }

                    if(stat.isFile()) {
                        if (fileName.slice(-5) === ".table") {
                            tablesFiles.push(filePath);
                        }
                        else if (fileName.slice(-5) === ".type") {
                            typesFiles.push(filePath);
                        }
                        else if (fileName.slice(-4) === ".blank") {
                            blanksFiles.push(filePath);
                        }

                        next();
                        return;
                    }
                    else if(stat.isDirectory()){
                        gatherFiles(filePath, function (error, _tablesFiles, _typesFiles, _blanksFiles) {
                            if (error) {
                                next(error);
                                return;
                            }
                            else {
                                tablesFiles = tablesFiles.concat(_tablesFiles);
                                typesFiles = typesFiles.concat(_typesFiles);
                                blanksFiles = blanksFiles.concat(_blanksFiles);

                                next();
                                return;
                            }
                        });
                    }
                });
            }, function (error) {
                if (error) {
                    next(error);
                }
                else {
                    next();
                }
            });
        },
        function (next) {
            next(null, tablesFiles, typesFiles, blanksFiles);
        }
    ], callback);
};

//call start
function main() {
    var tablesFiles     = [];
    var typesFiles      = [];
    var blanksFiles     = [];
    var parsedArguments = argumentsParser(argumentsDefinitions);
    var input           = null;

    if (lo.isString(parsedArguments.config)) {
        let config = JSON.parse(fs.readFileSync(parsedArguments.config));

        if (!lo.isArray(config.input)) {
            throw new Error("No input in config file");
        }

        if (!lo.isString(config.output)) {
            throw new Error("No output in config file");
        }

        input                   = config.input;
        Processor.outputPath    = config.output;
    } else {
        input                   = parsedArguments.input;
        Processor.outputPath    = parsedArguments.output;
    }

    console.log(colors.rainbow("Start processing..."));

    async.waterfall([
        function (next) {
            async.eachOf(input, function (path, index, next) {

                gatherFiles(path, function (error, foundTablesFiles, foundTypesFiles, foundBarsFiles) {
                    if (error) {
                        next(error);
                        return;
                    }

                    tablesFiles = tablesFiles.concat(foundTablesFiles);
                    typesFiles = typesFiles.concat(foundTypesFiles);
                    blanksFiles = blanksFiles.concat(foundBarsFiles);

                    next();
                });
            }, next);
        },
        function (next) {
            console.log(colors.cyan("> loading tables"));

            for (let filePath of tablesFiles)
            {
                try {
                    var fileContent = JSON.parse(stripJsonComments(fs.readFileSync(filePath).toString()));

                    Storage.addTable(new Table(fileContent));
                } catch (error) {
                    next("Error on parsing file " + filePath + " catch: " + error);
                    return;
                }
            }

            next();
        },
        function (next) {
            console.log(colors.cyan("> loading types"));

            for (let filePath of typesFiles)
            {
                try {
                    var fileContent = JSON.parse(stripJsonComments(fs.readFileSync(filePath).toString()));

                    Storage.addType(new Type(fileContent));
                } catch (error) {
                    next("Error on parsing file " + filePath + " catch: " + error);
                    return;
                }
            }

            next();
        },
        function (next) {
            console.log(colors.cyan("> loading blanks"));

            for (let filePath of blanksFiles)
            {
                try {
                    var fileContent = JSON.parse(stripJsonComments(fs.readFileSync(filePath).toString()));

                    Storage.addBlank(new Blank(fileContent));
                } catch (error) {
                    next("Error on parsing file " + filePath + " catch: " + error);
                    return;
                }
            }

            next();
        },
        function (next) {
            console.log(colors.cyan("> start settle references"));
            Storage.settleReferences();
            console.log(colors.cyan("> start code generation"));
            Processor.generateSource(Storage);
            next();
        }
    ], function (error) {
        if (error) {
            console.error(colors.bgRed(error));
        }
        console.log(colors.rainbow("Done processing!"));
    });
}

main();
