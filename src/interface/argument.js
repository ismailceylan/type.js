import { typeName } from "../utils/index.js";

export default function Argument()
{
	this.types = [];
	this.isRequired = false;
	this.defaultValue = undefined;
}

Argument.prototype.allows = function( name, types )
{
	this.name = name;
	this.types = typeName( types ) == "Array"
		?   types
		: [ types ];
}

Argument.prototype.required = function()
{
	this.isRequired = true;
	return this;
}

Argument.prototype.default = function( value )
{
	this.defaultValue = value;
	return this;
}
