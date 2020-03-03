"use strict";
// import * as RED from "node-red";
// import { Red } from "node-red";
Object.defineProperty(exports, "__esModule", { value: true });
const validate = require("validate-vat");
class vat_lookup {
    constructor(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        RED.nodes.createNode(this, config);
        this.node = this;
        this.node.status({});
        this.node.on("input", this.oninput);
    }
    isNumeric(num) {
        return !isNaN(num);
    }
    async oninput(msg) {
        try {
            this.node.status({});
            if (msg.countrycode !== null && msg.countrycode !== undefined && msg.countrycode !== "") {
                this.config.countrycode = msg.countrycode;
            }
            if (msg.vatnumber !== null && msg.vatnumber !== undefined && msg.vatnumber !== "") {
                this.config.vatnumber = msg.vatnumber;
            }
            if (msg.payload !== null && msg.payload.countrycode !== null && msg.payload.countrycode !== undefined && msg.payload.countrycode !== "") {
                this.config.countrycode = msg.payload.countrycode;
            }
            if (msg.payload !== null && msg.payload.vatnumber !== null && msg.payload.vatnumber !== undefined && msg.payload.vatnumber !== "") {
                this.config.vatnumber = msg.payload.vatnumber;
            }
            console.log("vat_lookup countrycode:" + this.config.countrycode + " vatnumber: " + this.config.vatnumber);
            this.node.status({ fill: "blue", shape: "dot", text: "Validating" });
            validate(this.config.countrycode, this.config.vatnumber, (error, validationInfo) => {
                if (error) {
                    return this.HandleError(this, error);
                }
                this.node.status({});
                msg.payload = validationInfo;
                this.node.send(msg);
            });
        }
        catch (error) {
            this.HandleError(this, error);
        }
    }
    HandleError(node, error) {
        console.error(error);
        var message = error;
        try {
            if (error.message) {
                message = error.message;
                //node.error(error, message);
                node.error(message, error);
            }
            else {
                //node.error(error, message);
                node.error(message, error);
            }
        }
        catch (error) {
            console.error(error);
        }
        try {
            if (message === null || message === undefined || message === "") {
                message = "";
            }
            node.status({ fill: "red", shape: "dot", text: message.toString().substr(0, 32) });
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.vat_lookup = vat_lookup;
//# sourceMappingURL=vat_nodes.js.map