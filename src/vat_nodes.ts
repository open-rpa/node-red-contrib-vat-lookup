// import * as RED from "node-red";
// import { Red } from "node-red";

declare var RED: any;
import * as validate from "validate-vat";

export interface Ivat_lookup {
    countrycode: string;
    vatnumber: string;
}
export class vat_lookup {

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
                if (error) { return this.HandleError(this, error); }
                this.node.status({});
                msg.payload = validationInfo;
                this.node.send(msg);
            })
        } catch (error) {
            this.HandleError(this, error);
        }
    }
    public HandleError(node: any, error: any): void {
        console.error(error);
        var message: string = error;
        try {
            if (error.message) {
                message = error.message;
                //node.error(error, message);
                node.error(message, error);
            } else {
                //node.error(error, message);
                node.error(message, error);
            }
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