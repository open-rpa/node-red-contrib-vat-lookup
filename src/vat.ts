import { Red } from "node-red";
import * as validate from "validate-vat";
// import * as vat from "./vat_nodes";

// declare var RED: any;
// declare function fn(RED: Red): void;
// export = fn;
export = function (RED: Red) {

    interface Ivat_lookup {
        countrycode: string;
        vatnumber: string;
    }
    class vat_lookup {

        public node: any = null;
        public name: string = "";
        constructor(public config: Ivat_lookup) {
            console.log("vat_lookup");
            console.log(RED);
            (RED as any).nodes.createNode(this, config);
            this.node = this;
            this.node.status({});
            this.node.on("input", this.oninput);
        }
        isNumeric(num) {
            return !isNaN(num)
        }
        async oninput(msg: any) {
            try {
                this.node.status({});

                let countrycode = this.config.countrycode;
                let vatnumber = this.config.vatnumber;

                if (msg.countrycode !== null && msg.countrycode !== undefined && msg.countrycode !== "") { countrycode = msg.countrycode; }
                if (msg.vatnumber !== null && msg.vatnumber !== undefined && msg.vatnumber !== "") { vatnumber = msg.vatnumber; }
                if (msg.payload !== null && msg.payload.countrycode !== null && msg.payload.countrycode !== undefined && msg.payload.countrycode !== "") { countrycode = msg.payload.countrycode; }
                if (msg.payload !== null && msg.payload.vatnumber !== null && msg.payload.vatnumber !== undefined && msg.payload.vatnumber !== "") { vatnumber = msg.payload.vatnumber; }

                console.log("vat_lookup countrycode:" + countrycode + " vatnumber: " + vatnumber);
                this.node.status({ fill: "blue", shape: "dot", text: "Validating" });
                validate(countrycode, vatnumber, (error, validationInfo) => {
                    if (error) { return this.HandleError(this, error, msg); }
                    this.node.status({});
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
                // if (error.message) {
                //     message = error.message;
                //     //node.error(error, message);
                //     node.error(message, error);
                // } else {
                //     //node.error(error, message);
                //     node.error(message, error);
                // }
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

// import * as RED from "node-red";
// import { Red } from "node-red";
// import { Red } from "node-red";

// declare var RED: any;
// // declare var RED: any;

