"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var express_1 = __importDefault(require("express"));
var neo4j_driver_1 = __importDefault(require("neo4j-driver"));
exports.app = (0, express_1.default)();
var driver = neo4j_driver_1.default.driver('neo4j://localhost:7687', neo4j_driver_1.default.auth.basic('neo4j', 'tony2003'));
var cors = require('cors');
exports.app.use(cors({ origin: 'http://blacksheep.zapto.org:5555' }));
exports.app.get('/Dataset/getAllRelations', 
// Request Body : {identity : <dataset-id>}
// Response Bode : [{relation : {identity : number, type : string}, node : {identity : number, name : string, type : string}}]
function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var identity, session, result, dat, _i, _a, record, relation, node, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                identity = JSON.parse(req.query.identity);
                session = driver.session();
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, 4, 6]);
                return [4 /*yield*/, session.run('MATCH (d:Dataset)-[relation]-(node) WHERE id(d) = $identity return relation, node', { identity: identity })];
            case 2:
                result = _b.sent();
                console.log('Sending Query Result');
                dat = [];
                for (_i = 0, _a = result.records; _i < _a.length; _i++) {
                    record = _a[_i];
                    relation = record.get('relation');
                    node = record.get('node');
                    dat.push({ relation: { identity: relation.identity.low, type: relation.type }, node: { identity: node.identity.low, name: node.properties.name, type: node.labels[0] } });
                }
                console.log("Query for relations to " + identity + " done, sending response");
                res.send(dat);
                return [3 /*break*/, 6];
            case 3:
                error_1 = _b.sent();
                console.log('Query Failed !');
                console.log(error_1);
                res.status(400);
                res.send(error_1);
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, session.close()];
            case 5:
                _b.sent();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
exports.app.get('/Node/getAllRelations', 
// Request Body : {identity : number}
// Response Body : [{relation : {identity : number, type : string}, node : {identity : number, type : string, name}}]
function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var identity, session, result, dat, _i, _a, record, relation, node, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log(req.query.identity, req.query.type);
                identity = Number(req.query.identity);
                session = driver.session();
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, 4, 6]);
                return [4 /*yield*/, session.run('MATCH (d)-[relation]-(node) WHERE id(d) = $identity return relation, node', { identity: identity })];
            case 2:
                result = _b.sent();
                dat = [];
                for (_i = 0, _a = result.records; _i < _a.length; _i++) {
                    record = _a[_i];
                    relation = record.get('relation');
                    node = record.get('node');
                    dat.push({ relation: { identity: relation.identity.low, type: relation.type }, node: { identity: node.identity.low, name: node.properties.name, type: node.labels[0] } });
                }
                console.log("Query for relations to " + identity + " done, sending response");
                res.send(dat);
                return [3 /*break*/, 6];
            case 3:
                error_2 = _b.sent();
                console.log('Query Failed !');
                console.log(error_2);
                res.status(400);
                res.send(error_2);
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, session.close()];
            case 5:
                _b.sent();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
exports.app.get('/Dataset/info', 
// Request Body : {identity : number}
// Response Body : {identity : number, properties : {name : string, identifier : string, landingPage : string, accrualPeriodicity :string, description : string,  dataQuality : string , license :string, issued:string, distribution : object}}
function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var identity, session, result, dat, _i, _a, record, dataset, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                identity = Number(req.query.identity);
                session = driver.session();
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, 4, 6]);
                return [4 /*yield*/, session.run('MATCH (d:Dataset) WHERE id(d) = $identity return d', { identity: identity })];
            case 2:
                result = _b.sent();
                console.log('Sending Query Result');
                dat = [];
                for (_i = 0, _a = result.records; _i < _a.length; _i++) {
                    record = _a[_i];
                    console.log(record.toObject());
                    dataset = record.get('d');
                    dat.push({ identity: dataset.identity.low, type: dataset.labels[0], properties: dataset.properties });
                }
                console.log("Query for relations to " + identity + " done, sending response ");
                res.send(dat);
                return [3 /*break*/, 6];
            case 3:
                error_3 = _b.sent();
                console.log('Query Failed !');
                console.log(error_3);
                res.status(400);
                res.send(error_3);
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, session.close()];
            case 5:
                _b.sent();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
exports.app.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, data, session, result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = req.query.string;
                data = JSON.parse(req.query.data);
                session = driver.session();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, 4, 6]);
                return [4 /*yield*/, session.run(query, data)];
            case 2:
                result = _a.sent();
                console.log('Sending Query Result');
                console.log(typeof (result.records));
                res.send(result.records);
                return [3 /*break*/, 6];
            case 3:
                error_4 = _a.sent();
                console.log('Query Failed !');
                res.status(400);
                res.send(error_4);
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, session.close()];
            case 5:
                _a.sent();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=server.js.map