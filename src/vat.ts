import { Red } from "node-red";
import * as vat from "./vat_nodes";


// declare function fn(RED: Red): void;
// export = fn;
export = function (RED: Red) {
    RED.nodes.registerType("vat lookup", vat.vat_lookup);
}
