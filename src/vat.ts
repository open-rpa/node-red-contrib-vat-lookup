import { Red } from "node-red";
import * as validate from "validate-vat";
export = function (RED: Red) {
    interface Ivat_lookup {
        countrycode: string;
        vatnumber: string;
    }
    class vat_lookup {

        public node: any = null;
        public name: string = "";
        constructor(public config: Ivat_lookup) {
            (RED as any).nodes.createNode(this, config);
            this.node = this;
            this.node.status({});
            this.node.on("input", this.oninput);
        }
        isNumeric(num) {
            return !isNaN(num)
        }
        public static EvaluateNodeProperty<T>(node: any, msg: any, name: string, ignoreerrors: boolean = false) {
            return new Promise<T>((resolve, reject) => {
                const _name = node.config[name];
                let _type = node.config[name + "type"];
                if (_name == null) return resolve(null);
                RED.util.evaluateNodeProperty(_name, _type, node, msg, (err, value) => {
                    if (err && !ignoreerrors) {
                        reject(err);
                    } else {
                        resolve(value);
                    }
                })
            });
        }
        public static SetMessageProperty(msg: any, name: string, value: any) {
            RED.util.setMessageProperty(msg, name, value);
        }

        async oninput(msg: any) {
            try {
                this.node.status({});

                const countrycode: string = (await vat_lookup.EvaluateNodeProperty<string>(this, msg, "countrycode")) || "";
                const vatnumber: string = (await vat_lookup.EvaluateNodeProperty<string>(this, msg, "vatnumber")) || "";

                this.node.status({ fill: "blue", shape: "dot", text: "Validating" });
                validate(countrycode, vatnumber.toString(), (error, validationInfo) => {
                    if (error) { return this.HandleError(this, error, msg); }
                    if (validationInfo && validationInfo.name && validationInfo.name != "") {
                        this.node.status({ fill: "green", shape: "dot", text: validationInfo.name });
                    } else { this.node.status({}); }

                    msg.payload = validationInfo;
                    this.node.send(msg);
                })
            } catch (error) {
                this.HandleError(this, error, msg);
            }
        }
        public HandleError(node: any, error: any, msg: any): void {
            console.error(error);
            var message: string = error;
            try {
                if (typeof error === 'string' || error instanceof String) {
                    error = new Error(error as string);
                }
                node.error(error, msg);
            } catch (error) {
                console.error(error);
            }
            try {
                if (message === null || message === undefined || message === "") { message = ""; }
                node.status({ fill: "red", shape: "dot", text: message.toString().substr(0, 32) });
            } catch (error) {
                console.error(error);
            }
        }

    }
    RED.nodes.registerType("vat lookup", (vat_lookup as any));
}
