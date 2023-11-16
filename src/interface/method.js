import { typeName } from "../utils/index.js";
import { Argument } from "./index.js";

export default function Method()
{
	this.arguments = [];
	this.returnTypes = [];
}

Method.prototype.argument = function( types )
{
	var arg = new Argument;

	arg.allows( types );
	this.arguments.push( arg );

	return arg;
}

Method.prototype.returns = function( types )
{
	this.returnTypes = typeName( types ) == "Array"
		?   types
		: [ types ];
}
