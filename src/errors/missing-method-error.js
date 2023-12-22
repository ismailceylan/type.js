export default class MissingMethodError extends Error
{
	constructor( iface, type, rule )
	{
		super();

		this.name = "MissingMethodError";
		this.message = `The ${ iface.name } interface requires to define ${ rule.name } method on ${ type.name } type. Type must therefore be declared abstract or implement the remaining methods.`
	}
}
