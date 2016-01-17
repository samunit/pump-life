/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        messageDiv.visibility = false;
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.getElementById("searchBtn").addEventListener("click", this.searchBlutooth);
        document.getElementById("disconBtn").addEventListener("click", this.disconnect);
        document.getElementById("valveOn").addEventListener("click", this.valveOn);
        document.getElementById("valveOff").addEventListener("click", this.valveOff);
        document.getElementById("lightOn").addEventListener("click", this.lightOn);
        document.getElementById("lightOff").addEventListener("click", this.lightOff);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        blutoothList.ontouchstart = app.connect;
    },
    
    connect: function(e){
        app.setStatus("Connecting....");
        var device = e.target.getAttribute('deviceId');
        var name = e.target.getAttribute('deviceName');
        //console.log("Requesting connection to " + device);
        bluetoothSerial.connect(device, app.onconnect(name), app.ondisconnect);
    },
    
    onconnect: function(name) {
        app.setStatus("Connected.");
        connectedTo.innerHTML = "Connected to: " + name;
    },
    
    ondisconnect: function() {
        app.setStatus("Disconnected.");
    },
    
    disconnect: function(){
        bluetoothSerial.disconnect(function(result){
            connectedTo.innerHTML = "";
            app.setStatus("Disconnected.");
        }, function(error){
            app.setStatus("Error Disconnecting.");
        });
    },
    
    sendToArduino: function(c) {
        bluetoothSerial.write("c" + c + "\n");
        console.log("c " + c + "\n");
    },
    
    searchBlutooth: function(){
        blutoothList.innerHTML = "Discovering...";
        app.setStatus("Looking for Bluetooth Devices...");
        
        bluetoothSerial.discoverUnpaired(
        function(results){
            app.populateBluetooth(results);
        },
        function(error){
            blutoothList.innerHTML = "Bluetooth Error";
        });
    },
    
    populateBluetooth: function(devices){
        var listItem, deviceId;
        blutoothList.innerHTML = "";
        
        devices.forEach(function(device){
            listItem = document.createElement('li');
            listItem.className = "listItem";
            
            if (device.hasOwnProperty("uuid")) {
                deviceId = device.uuid;
            }
            else if (device.hasOwnProperty("address")) {
                deviceId = device.address;
            } else {
                deviceId = "ERROR " + JSON.stringify(device);
            }
            listItem.setAttribute('deviceId', device.address);
            listItem.setAttribute('deviceName', device.name);
            listItem.innerHTML = device.name + "<br/><i>" + deviceId + "</i>";
            blutoothList.appendChild(listItem);
        });
        
        if (devices.length === 0) {
            
            if (cordova.platformId === "ios") { // BLE
                app.setStatus("No Bluetooth Peripherals Discovered.");
            } else { // Android
                app.setStatus("Please Pair a Bluetooth Device.");
            }

        } else {
            app.setStatus("Found " + devices.length + " device" + (devices.length === 1 ? "." : "s."));
        }
    },
    
    lightOn: function(){
        app.sendToArduino("1");
    },
    lightOff: function(){
        app.sendToArduino("2");
    },
    valveOn: function(){
        app.sendToArduino("3");
    },
    valveOff: function(){
        app.sendToArduino("4");
    },
    
    timeoutId: 0,
    setStatus: function(status) {
        messageDiv.visibility = true;
        if (app.timeoutId) {
            clearTimeout(app.timeoutId);
        }
        messageDiv.innerText = status;
        app.timeoutId = setTimeout(function() { messageDiv.innerText = ""; }, 4000);
        
    },
};

app.initialize();