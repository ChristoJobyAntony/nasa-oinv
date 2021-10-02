"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var server_1 = require("./server");
// Listen to server
server_1.app.listen(7070, '0.0.0.0', function () {
    console.log('Server Running here 👉 https://readmythoughts.ddns.net:7070');
});
// // Test 1
axios_1.default.get('http://readmythoughts.ddns.net:7070/Dataset/getAllRelations', { params: { identity: 2131 } }).then(function (response) {
    console.log('RESPONSE BODY');
    console.log(response.data);
}).catch(function (e) {
    console.log('Query Failed !');
    console.log(e);
});
// Test 2
axios_1.default.get('http://readmythoughts.ddns.net:7070/Node/getAllRelations', { params: { identity: 3 } }).then(function (response) {
    console.log('RESPONSE BODY');
    console.log(response.data);
}).catch(function (e) {
    console.log('Query Failed !');
    console.log(e);
});
// Test 3
axios_1.default.get('http://readmythoughts.ddns.net:7070/Dataset/info', { params: { identity: 2131 } }).then(function (response) {
    console.log('RESPONSE BODY');
    console.log(response.data);
}).catch(function (e) {
    console.log('Query Failed !');
    console.log(e);
});
//# sourceMappingURL=test.js.map