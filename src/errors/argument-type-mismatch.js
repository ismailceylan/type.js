import { readableJoin, typeNames } from "../utils/index.js";

export default class ArgumentTypeMismatch extends Error
{
	constructor( iface, type, methodRule, argRule, position )
	{
		super();

		this.name = "ArgumentTypeMismatch";
		this.message = `${ iface.name } interface requires ${ type.name }.${ methodRule.name } method's ${ position }st argument (${ argRule.name }) ${ readableJoin( typeNames( argRule.types ))} but received undefined.`
	}
}
