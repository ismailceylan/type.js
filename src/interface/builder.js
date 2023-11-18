import { Method, Property } from "./index.js";

export default function Builder()
{
	this.properties = {}
	this.methods = {}	
}

Builder.prototype.property = function( name, types )
{
	return this.properties[ name ] = new Property( name, types );
}

Builder.prototype.method = function( name, build )
{
	build(
		this.methods[ name ] = new Method( name )
	);
}
