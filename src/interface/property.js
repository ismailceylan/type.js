import { typeName } from "../utils/index.js";

export default function Property( name, types )
{
	this.name = name;
	this.isRequired = false;
	this.types = [];

	if( types )
	{
		this.allows( types );
	}
}

Property.prototype.required = function()
{
	this.isRequired = true;
	return this;
}

Property.prototype.allows = function( types )
{
	this.types = typeName( types ) == "Array"
		?   types 
		: [ types ];
	
	return this;
}
