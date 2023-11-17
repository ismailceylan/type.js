export default class MissingPropError extends Error
{
	constructor( iface, type, rule )
	{
		super();

		this.name = "MissingPropError";
		this.message = `The ${ iface.name } interface requires to define ${ rule.name } property on ${ type.name } type.`
	}
}
