"use strict";
const validate = require("validate-vat");
module.exports = function (RED) {
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
        static EvaluateNodeProperty(node, msg, name, ignoreerrors = false) {
            return new Promise((resolve, reject) => {
                const _name = node.config[name];
                let _type = node.config[name + "type"];
                if (_name == null)
                    return resolve(null);
                RED.util.evaluateNodeProperty(_name, _type, node, msg, (err, value) => {
                    if (err && !ignoreerrors) {
                        reject(err);
                    }
                    else {
                        resolve(value);
                    }
                });
            });
        }
        static SetMessageProperty(msg, name, value) {
            RED.util.setMessageProperty(msg, name, value);
        }
        async oninput(msg) {
            try {
                this.node.status({});
                const countrycode = (await vat_lookup.EvaluateNodeProperty(this, msg, "countrycode")) || "";
                const vatnumber = (await vat_lookup.EvaluateNodeProperty(this, msg, "vatnumber")) || "";
                this.node.status({ fill: "blue", shape: "dot", text: "Validating" });
                validate(countrycode, vatnumber.toString(), (error, validationInfo) => {
                    if (error) {
                        return this.HandleError(this, error, msg);
                    }
                    if (validationInfo && validationInfo.name && validationInfo.name != "") {
                        this.node.status({ fill: "green", shape: "dot", text: validationInfo.name });
                    }
                    else {
                        this.node.status({});
                    }
                    msg.payload = validationInfo;
                    this.node.send(msg);
                });
            }
            catch (error) {
                this.HandleError(this, error, msg);
            }
        }
        HandleError(node, error, msg) {
            console.error(error);
            var message = error;
            try {
                if (typeof error === 'string' || error instanceof String) {
                    error = new Error(error);
                }
                node.error(error, msg);
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
    RED.nodes.registerType("vat lookup", vat_lookup);
};
//# sourceMappingURL=vat.js.map