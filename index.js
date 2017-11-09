var async              = require("async");
var colors             = require("colors");
var fs                 = require("fs");
var path               = require("path");
var stripJsonComments  = require("strip-json-comments");

var Storage   = require("./src/Storage.js");
var domain    = require("domain").create();

var gatherFiles = function (folderPath, callback) {
    var listsFiles  = [];
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
                        if (fileName.slice(-5) === ".list") {
                            listsFiles.push(filePath);
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
                        gatherFiles(filePath, function (error, _listsFiles, _typesFiles, _blanksFiles) {
                            if (error) {
                                next(error);
                                return;
                            }
                            else {
                                listsFiles = listsFiles.concat(_listsFiles);
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
            next(null, listsFiles, typesFiles, blanksFiles);
        }
    ], callback);
};

domain.enter();

//call start
function main() {
    var listsFiles = [];
    var typesFiles = [];
    var blanksFiles = [];

    console.log(colors.rainbow("Start processing..."));

    Storage.outputPath = process.argv[0];

    async.waterfall([
        function (next) {
            async.eachOf(process.argv, function (path, index, next) {
                if (index === 0 || index === (process.argv.length -1)) {
                    next();
                    return;
                }

                gatherFiles(path, function (error, foundListsFiles, foundTypesFiles, foundBarsFiles) {
                    if (error) {
                        next(error);
                        return;
                    }

                    listsFiles = listsFiles.concat(foundListsFiles);
                    typesFiles = typesFiles.concat(foundTypesFiles);
                    blanksFiles = blanksFiles.concat(foundBarsFiles);

                    next();
                });
            }, next);
        },
        function (next) {
            console.log(colors.cyan("> loading lists"));

            for (let filePath of listsFiles)
            {
                try {
                    var fileContent = JSON.parse(stripJsonComments(fs.readFileSync(filePath).toString()));

                    Storage.addList(fileContent);
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

                    Storage.addType(fileContent);
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

                    Storage.addBlank(fileContent);
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
            Storage.generateSource();
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
