import { typeName } from "../utils/index.js";
import { Argument } from "./index.js";

export default function Method( name )
{
	this.name = name;
	this.arguments = [];
	this.returnTypes = [];
}

Method.prototype.argument = function( name, types )
{
	const arg = new Argument( name );

	this.arguments.push(
		arg.allows( types )
	);

	return arg;
}

Method.prototype.returns = function( types )
{
	this.returnTypes = typeName( types ) == "Array"
		? types
		: types === undefined
			? []
			: [ types ];
	
	return this;
}
