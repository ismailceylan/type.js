export default class MissingArgumentError extends Error
{
	constructor( iface, type, methodRule, argRule, position )
	{
		super();

		this.name = "MissingArgumentError";
		this.message = `${ iface.name } interface requires ${ type.name }.${ methodRule.name } method's ${ position + 1 }. argument ("${ argRule.name }") defined.`;
	}
}
