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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var SUCCESS_MSG = "Success. The device will reboot to the new firmware in 10 seconds";
var FIRMWARE_HEADER_SIZE = 10;
var FIRMWARE_HEADER_SIZE_WORDS = FIRMWARE_HEADER_SIZE / 2;
var inUpdate = false;
var RemoteRFIDs = [];
function log() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var timestamp = '[' + new Date().toISOString() + '] ';
    args[0] = timestamp + args[0];
    console.log.apply(console, args);
}
function successProgram(msg) {
    setProgress(100.0);
    var txt = document.getElementById('progText');
    txt.innerText = msg;
}
function error(msg) {
    window.alert(msg);
    setProgress(-1);
}
function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t);
    });
}
function getImageLength(curPage) {
    if (curPage === "B") {
        return 120 * 1024;
    }
    else if (curPage === "A") {
        return 120 * 1024;
    }
    else {
        return 0;
    }
}
function setProgress(percent, name) {
    var p = document.getElementById('progDiv');
    if (percent < 0) {
        p.style.display = 'none';
    }
    else {
        p.style.display = 'initial';
    }
    percent = percent * 98.0 / 100.0 + 2.0;
    var txt = document.getElementById('progText');
    txt.innerText = "Programming " + name + " - " + Math.round(percent) + "%";
    var prog = document.getElementById('progBar');
    prog.value = percent / 100.0 * prog.max;
}
function enter() {
    if (inUpdate) {
        console.log("enter fail");
        return true;
    }
    inUpdate = true;
    var nodes = document.getElementById("myButtons").querySelectorAll('a,input');
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.backgroundColor = "#CCCCCC";
        nodes[i].disabled = true;
    }
    console.log("enter");
    return false;
}
function exit() {
    var nodes = document.getElementById("myButtons").querySelectorAll('a,input');
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].disabled = false;
        nodes[i].style.backgroundColor = null;
    }
    inUpdate = false;
    console.log("exit");
}
function localFileChanged(o) {
    if (!o.files.length || !o.files[0])
        return true;
    var f = o.files[0];
    o.value = null;
    if (enter())
        return true;
    var reader = new FileReader();
    reader.onload = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var contents, view, pos, res, i, curPage, nextPage, length, firmwareRev, firmwareWords, firmwareCrc, firmwareBaseAddr, flagReboot, flagReflashComplete, addr, qlen, datastr, stat, percent, i_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("FileReader onload");
                        contents = e.target.result;
                        view = new Uint16Array(e.target.result['result']);
                        pos = 0;
                        setProgress(0.0, f.name);
                        return [4, refreshVariable(["curfwpg"], 0, "")];
                    case 1:
                        res = _a.sent();
                        i = 0;
                        for (i = 0; i < 10; i++)
                            window.clearInterval(i);
                        if (!res.ok)
                            return [2];
                        curPage = res.resp[0];
                        nextPage = { A: "B", B: "A" }[curPage];
                        if (!nextPage) {
                            exit();
                            return [2, error("Invalid image returned: " + curPage)];
                        }
                        length = contents.toString().length;
                        if (length > 120 * 1024) {
                            console.error("length=" + length + ", cur=" + view.length * 2);
                            exit();
                            return [2, [2, error("Image over 120kb")]];
                        }
                        console.info("length=" + length + ", cur=" + view.length * 2);
                        firmwareRev = view[0];
                        firmwareWords = view[1];
                        firmwareCrc = view[2];
                        firmwareBaseAddr = view[3] | (view[4] << 16);
                        console.info("REV.....0x" + firmwareRev.toString(16));
                        console.info("WORDS...0x" + firmwareWords.toString(16));
                        console.info("CRC.....0x" + firmwareCrc.toString(16));
                        console.info("BASE....0x" + firmwareBaseAddr.toString(16));
                        return [4, refreshVariable(["qavail", "update_percent", "update_status"], 0, "localupdate=" + length)];
                    case 2:
                        res = _a.sent();
                        flagReboot = false;
                        flagReflashComplete = false;
                        addr = firmwareBaseAddr;
                        pos = FIRMWARE_HEADER_SIZE_WORDS;
                        _a.label = 3;
                    case 3:
                        if (!true) return [3, 12];
                        return [4, delay(50)];
                    case 4:
                        _a.sent();
                        if (!res.ok) {
                            exit();
                            return [2, error("Upload failed: " + JSON.stringify(res.error))];
                        }
                        qlen = 32;
                        datastr = "";
                        stat = res.resp[0];
                        if (!(pos >= view.length - FIRMWARE_HEADER_SIZE_WORDS)) return [3, 6];
                        successProgram(SUCCESS_MSG);
                        rebootDevice();
                        return [4, delay(10000)];
                    case 5:
                        _a.sent();
                        location.reload();
                        return [2];
                    case 6:
                        if (stat == 2 || stat == 3) {
                            exit();
                            return [2, error("Failure code returned: " + stat)];
                        }
                        _a.label = 7;
                    case 7:
                        percent = (pos / (view.length - FIRMWARE_HEADER_SIZE_WORDS)) * 100;
                        setProgress(percent, f.name);
                        if (!(qlen <= 0)) return [3, 9];
                        log("Not ready to write:", res.resp);
                        if (qlen < 0) {
                            log("Update not ready yet");
                        }
                        return [4, delay(100)];
                    case 8:
                        _a.sent();
                        return [3, 10];
                    case 9:
                        if (flagReflashComplete && !flagReboot) {
                            flagReboot = true;
                        }
                        else {
                            datastr += "data=" + addr.toString(16) + ",";
                            for (i_1 = 0; i_1 < 32; i_1++) {
                                if (pos > view.length - 1) {
                                    flagReflashComplete = true;
                                    break;
                                }
                                datastr += view[pos].toString(16) + ",";
                                pos++;
                            }
                            addr += 64;
                        }
                        _a.label = 10;
                    case 10: return [4, refreshVariable(["update_status", "update_position"], 0, datastr)];
                    case 11:
                        res = _a.sent();
                        console.info(res);
                        if (res[0] == 3)
                            return [2, error("Update Failed: Failure to write")];
                        return [3, 3];
                    case 12: return [2];
                }
            });
        });
    };
    reader.readAsArrayBuffer(f);
    return false;
}
function refreshVariable(varArray, refreshRate, extra) {
    return new Promise(function (resolve) {
        try {
            var i;
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    var r = this.responseText;
                    if (r) {
                        var resp = void 0;
                        try {
                            resp = JSON.parse(this.responseText.replace(/\n/g, "\\n").replace(/\r/g, "\\r"));
                            log(JSON.stringify(varArray) + " = " + JSON.stringify(resp));
                            if (varArray.length != resp.length) {
                                throw new Error("Unexpected response length did not match request");
                            }
                            for (i = 0; i < varArray.length; ++i) {
                                var varName = varArray[i];
                                if (varName === "dbg_out") {
                                    var ta = document.getElementById(varName);
                                    ta.value += resp[i];
                                    ta.scrollTop = ta.scrollHeight;
                                    continue;
                                }
                                var o = document.getElementById(varName);
                                if (o) {
                                    if (o.tagName === "INPUT") {
                                        o.value = resp[i];
                                    }
                                    else {
                                        o.innerText = resp[i];
                                    }
                                }
                                if (varName === "percent") {
                                    update_device_percent(resp[i]);
                                }
                                else if (varName === "battery") {
                                    update_device_battery(resp[i]);
                                }
                                else if (varName === "rx") {
                                    update_device_rx(resp[i]);
                                }
                                else if (varName === "chnames1") {
                                    update_channel_names(0, resp[i]);
                                }
                                else if (varName === "chnames2") {
                                    update_channel_names(10, resp[i]);
                                }
                                else if (varName === "chnames3") {
                                    update_channel_names(20, resp[i]);
                                }
                                else if (varName === "rfdevs") {
                                    update_table(resp[i]);
                                }
                                else if (varName === "remotes") {
                                    update_remote_names(0, resp[i]);
                                }
                                else if (varName === "dev_fw") {
                                    update_device_fw(resp[i]);
                                }
                            }
                            resolve({ ok: true, resp: resp });
                        }
                        catch (e) {
                            console.error("Error: " + this.responseText, e);
                            resolve({ ok: false, error: e });
                        }
                    }
                }
            };
            var url = "ajax.shtml?var=";
            for (i = 0; i < varArray.length; ++i)
                url += varArray[i] + ",";
            url = url.substring(0, url.length - 1);
            if (extra) {
                url += "&" + extra;
            }
            req.open('GET', url, true);
            req.send(null);
            if (refreshRate) {
                setInterval(refreshVariable, refreshRate, varArray, 0);
            }
        }
        catch (e) {
            resolve({ ok: false, error: e });
        }
    });
}
function commandPair() {
    var varChannel = document.getElementById("ch").value;
    var req = new XMLHttpRequest();
    var url = "ajax.shtml?pair=" + varChannel;
    req.open('GET', url, true);
    req.send(null);
}
function commandLink() {
    var varChannel = document.getElementById("ch").value;
    var req = new XMLHttpRequest();
    var url = "ajax.shtml?link=" + varChannel;
    req.open('GET', url, true);
    req.send(null);
}
function commandUp() {
    var varChannel = document.getElementById("ch").value;
    var req = new XMLHttpRequest();
    var url = "ajax.shtml?up=" + varChannel;
    req.open('GET', url, true);
    req.send(null);
}
function commandDown() {
    var varChannel = document.getElementById("ch").value;
    var req = new XMLHttpRequest();
    var url = "ajax.shtml?down=" + varChannel;
    req.open('GET', url, true);
    req.send(null);
}
function commandStop() {
    var varChannel = document.getElementById("ch").value;
    var req = new XMLHttpRequest();
    var url = "ajax.shtml?stop=" + varChannel;
    req.open('GET', url, true);
    req.send(null);
}
function commandP2() {
    var varChannel = document.getElementById("ch").value;
    var req = new XMLHttpRequest();
    var url = "ajax.shtml?p2=" + varChannel;
    req.open('GET', url, true);
    req.send(null);
}
function commandReboot() {
    var req = new XMLHttpRequest();
    var url = "ajax.shtml?reboot=0";
    req.open('GET', url, true);
    req.send(null);
}
function commandPairRemote() {
    var varType = document.getElementById("selectremotetype").value;
    var req = new XMLHttpRequest();
    var url = "ajax.shtml?pairremote?type=" + varType;
    req.open('GET', url, true);
    req.send(null);
}
function rebootDevice() {
    refreshVariable(["update_status"], 0, "reboot");
    inUpdate = false;
}
function populateRfDevicesTable() {
    var table = document.getElementById('rfdevstable');
    for (var i = 1; i <= 30; i++) {
        var tr = document.createElement('tr');
        tr.setAttribute('id', "row" + i.toString());
        var td1 = document.createElement('td');
        var td2 = document.createElement('td');
        var td3 = document.createElement('td');
        var td4 = document.createElement('td');
        var td5 = document.createElement('td');
        var td6 = document.createElement('td');
        var td7 = document.createElement('td');
        td1.innerHTML = i.toString();
        td2.innerHTML = '-';
        td3.innerHTML = '-';
        td4.innerHTML = '-';
        td5.innerHTML = '-';
        td6.innerHTML = '-';
        td7.innerHTML = '-';
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tr.appendChild(td6);
        tr.appendChild(td7);
        table.appendChild(tr);
    }
}
function populateRemotesTable() {
    var table = document.getElementById('remotestable');
    for (var i = 1; i <= 10; i++) {
        var remRowName = "remRow" + i.toString();
        var tr = document.createElement('tr');
        tr.setAttribute('id', remRowName);
        var td1 = document.createElement('td');
        var td2 = document.createElement('td');
        var td3 = document.createElement('td');
        var td4 = document.createElement('td');
        var td5 = document.createElement('td');
        td1.innerHTML = '-';
        td2.innerHTML = '-';
        td3.innerHTML = '-';
        td4.innerHTML = '-';
        var selectElement = document.createElement("select");
        selectElement.setAttribute("id", "remSel" + i.toString());
        selectElement.options.add(new Option('Not Set', '0'));
        selectElement.options.add(new Option('PS RF Remote', '4'));
        selectElement.options.add(new Option('PS Wind Sensor', '6'));
        selectElement.options.add(new Option('RA Wind Sensor', '7'));
        selectElement.value = "0";
        td5.appendChild(selectElement);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        table.appendChild(tr);
    }
}
function update_table(data) {
    var v = data.split(':');
    for (var i = 0; i < 30; i++) {
        var row = document.getElementById('row' + (i + 1).toString());
        if (v[i] != "0") {
            row.cells[1].innerHTML = v[i];
        }
        else {
            row.cells[1].innerHTML = '----------';
        }
    }
}
function update_device_battery(data) {
    var v = data.split(':');
    for (var i = 0; i < 30; i++) {
        var row = document.getElementById('row' + (i + 1).toString());
        row.cells[2].innerHTML = (v[i] * 0.001).toFixed(2);
    }
}
function update_device_percent(data) {
    var v = data.split(':');
    for (var i = 0; i < 30; i++) {
        var row = document.getElementById('row' + (i + 1).toString());
        row.cells[3].innerHTML = v[i];
    }
}
function update_device_rx(data) {
    var v = data.split(':');
    for (var i = 0; i < 30; i++) {
        var row = document.getElementById('row' + (i + 1).toString());
        row.cells[4].innerHTML = (v[i]).toString();
    }
}
function update_channel_names(startAt, data) {
    console.info("update_channel_names");
    var v = data.split(':');
    for (var i = 0; i < 10; i++) {
        var row = document.getElementById('row' + (startAt + i + 1).toString());
        row.cells[5].innerHTML = (v[i]).toString();
    }
}
function update_device_fw(data) {
    var v = data.split(':');
    for (var i = 0; i < 30; i++) {
        var row = document.getElementById('row' + (i + 1).toString());
        row.cells[6].innerHTML = (v[i]).toString();
    }
}
function update_remote_names(startAt, data) {
    console.info("update_remote_names");
    var v = data.split(':');
    for (var i = 0; i < 10; i++) {
        var record = v[i].split(',');
        var row = document.getElementById('remRow' + (startAt + i + 1).toString());
        var rfid = record[0];
        if (rfid !== "0") {
            if (RemoteRFIDs.indexOf(rfid) === -1) {
                RemoteRFIDs.push(rfid);
                console.log("Add Remote RFID", rfid);
            }
        }
        row.cells[1].innerHTML = record[1].toString();
        row.cells[2].innerHTML = rfid;
        row.cells[3].innerHTML = record[2].toString();
        var sel = document.getElementById("remSel" + (i + 1).toString());
        var type = record[3];
        sel.value = type;
    }
}
function addAction() {
    var table = document.getElementById('remoteactionstable');
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');
    var td4 = document.createElement('td');
    var td5 = document.createElement('td');
    var td6 = document.createElement('td');
    td1.innerHTML = (table.rows.length).toString();
    td2.innerHTML = "<input type=\"text\" style=\"width:100%\" value=\"\"></input>";
    td4.innerHTML = "<input type=\"text\" style=\"width:100%\" value=\"\"></input>";
    td6.innerHTML = "<input type=\"text\" style=\"width:100%\" value=\"\"></input>";
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    tr.appendChild(td6);
    var selectRemRfidElement = document.createElement("select");
    RemoteRFIDs.forEach(function (element) {
        selectRemRfidElement.options.add(new Option(element, element));
    });
    td3.appendChild(selectRemRfidElement);
    var selectElement = document.createElement("select");
    selectElement.setAttribute("id", "remActSel" + (table.rows.length + 1).toString());
    selectElement.options.add(new Option('Not Set', '0'));
    selectElement.options.add(new Option('PS Single RF Channel', '1'));
    selectElement.options.add(new Option('PS RF Group', '2'));
    selectElement.options.add(new Option('PS PoE IP Address', '3'));
    selectElement.value = "0";
    td5.appendChild(selectElement);
    table.appendChild(tr);
}
function update_remote_ids(data) {
    var v = data.split(':');
    for (var i = 0; i < 10; i++) {
        var row = document.getElementById('remRow' + (i + 1).toString());
        if (v[i] != "0") {
            row.cells[2].innerHTML = v[i];
        }
        else {
            row.cells[2].innerHTML = '----------';
        }
    }
}
